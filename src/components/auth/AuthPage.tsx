import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, UserPlus } from 'lucide-react';
import { StorageService, DEFAULT_ADMIN } from '../../services/storage';
import { CloudSync } from '../../services/cloudSync';
import { User } from '../../types';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { RegisterModal } from './RegisterModal';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onOpenRegister?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [inactiveUser, setInactiveUser] = useState<User | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessNotice(null);
    setInactiveUser(null);

    const cleanInput = userId.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanInput) {
      setError('Please enter your User ID or Email.');
      return;
    }

    if (!cleanPassword) {
      setError('Please enter your Password.');
      return;
    }

    // 1. Check Admin Credentials:
    // Only exact Izaz Admin handles: izaz786@metal.com, izaz786, admin
    const isAdminId =
      cleanInput === 'izaz786@metal.com' ||
      cleanInput === 'izaz786' ||
      cleanInput === 'admin' ||
      cleanInput === 'admin@metal.com' ||
      cleanInput === 'izaz786@gmail.com' ||
      cleanInput === 'admin@metal.space';

    if (isAdminId) {
      const isPassValid =
        cleanPassword.toLowerCase() === 'izaz@123' ||
        cleanPassword === 'Izaz@123' ||
        cleanPassword.toLowerCase() === 'admin' ||
        cleanPassword.toLowerCase() === 'admin123' ||
        cleanPassword === '123456';

      if (isPassValid) {
        const adminUser = StorageService.getUserByEmail('izaz786@metal.com') || DEFAULT_ADMIN;
        StorageService.setCurrentUserId(adminUser.id);
        onSuccess(adminUser);
        return;
      } else {
        setError('Incorrect password for Izaz Admin. (Password: Izaz@123)');
        return;
      }
    }

    // 2. Synchronize with backend server & cloud to ensure accounts created on other devices are present
    try {
      await StorageService.syncWithServer();
    } catch {
      // Continue with local data if offline
    }

    // Helper matcher to find user across any identifier
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const inputSuffix10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const inputNoSpaces = cleanInput.replace(/\s+/g, '');

    const matchUser = (u: User): boolean => {
      if (!u || u.role === 'admin') return false;
      const uEmail = (u.email || '').toLowerCase().trim();
      const uUsername = uEmail.split('@')[0];
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const userSuffix10 = uPhoneDigits.length >= 10 ? uPhoneDigits.slice(-10) : uPhoneDigits;
      const uAadhaarDigits = (u.aadhaarNumber || '').replace(/\D/g, '');
      const uPan = (u.panNumber || '').toLowerCase().trim();
      const uId = (u.id || '').toLowerCase().trim();
      const uName = (u.fullName || '').toLowerCase().trim();
      const uNameNoSpaces = uName.replace(/\s+/g, '');

      if (uEmail === cleanInput || uUsername === cleanInput) return true;
      if (uId === cleanInput) return true;
      if (uName === cleanInput || (inputNoSpaces.length > 2 && uNameNoSpaces === inputNoSpaces)) return true;
      if (uPan && uPan === cleanInput) return true;
      if (cleanDigits.length === 12 && uAadhaarDigits === cleanDigits) return true;
      if (cleanDigits.length >= 7) {
        if (uPhoneDigits === cleanDigits) return true;
        if (inputSuffix10.length >= 7 && userSuffix10 === inputSuffix10) return true;
        if (uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits)) return true;
      }
      return false;
    };

    // 3. User Lookup across local registered users
    let allUsers = StorageService.getUsers();
    let user = allUsers.find(matchUser);

    // 4. If account not found locally, query live backend /api/sync directly
    if (!user) {
      try {
        const sRes = await fetch(`/api/sync?_t=${Date.now()}`);
        if (sRes.ok) {
          const sData = await sRes.json();
          if (Array.isArray(sData.users)) {
            const serverFound = sData.users.find(matchUser);
            if (serverFound) {
              const cur = StorageService.getUsers();
              if (!cur.some((x) => x.id === serverFound.id || x.email.toLowerCase() === (serverFound.email || '').toLowerCase())) {
                cur.push(serverFound);
                StorageService.saveUsers(cur);
              }
              user = serverFound;
            }
          }
        }
      } catch {
        // Continue
      }
    }

    // 5. If still not found, fetch live from global cloud database
    if (!user) {
      try {
        const liveSync = await CloudSync.syncFromServer();
        if (liveSync.success && Array.isArray(liveSync.users)) {
          const cloudMatch = liveSync.users.find(matchUser);
          if (cloudMatch) {
            user = cloudMatch;
            const curUsers = StorageService.getUsers();
            if (!curUsers.some((u) => u.id === cloudMatch.id || u.email.toLowerCase() === cloudMatch.email.toLowerCase())) {
              curUsers.push(cloudMatch);
              StorageService.saveUsers(curUsers);
            }
          }
        }
      } catch {
        // Continue
      }
    }

    // 6. If user found: verify password
    if (user) {
      const localUser = user;
      if (localUser.isDeleted) {
        setInactiveUser(localUser);
        setError('This account has been deactivated. Click "Reactivate Account Now" below to restore your account.');
        return;
      }

      // Check password: user password or default demo passwords
      const isMatch =
        localUser.password === cleanPassword ||
        localUser.password?.toLowerCase() === cleanPassword.toLowerCase() ||
        cleanPassword.toLowerCase() === 'user@123' ||
        (localUser.email.toLowerCase() === 'sss8910642@gmail.com' &&
          (cleanPassword.toLowerCase() === 'suman@1234' ||
           cleanPassword.toLowerCase() === 'suman@123' ||
           cleanPassword === '123456')) ||
        (localUser.email.toLowerCase() === 'sakib786gf@gmail.com' &&
          cleanPassword.toLowerCase() === 'sakib@123') ||
        ((localUser.email.toLowerCase() === 'izazmolla3@gmail.com' ||
          localUser.email.toLowerCase() === 'izazm728@gmail.com' ||
          localUser.email.toLowerCase() === 'arabulsardar507@gmail.com') &&
          cleanPassword.toLowerCase() === 'izaz@123');

      if (!isMatch) {
        setError(`Incorrect password for ${localUser.fullName || cleanInput}. Please check and try again.`);
        return;
      }

      StorageService.setCurrentUserId(localUser.id);
      onSuccess(localUser);
      return;
    }

    // 7. Last check via Server Login API (in case user exists in another store)
    try {
      const serverLogin = await CloudSync.loginViaServer(cleanInput, cleanPassword);
      if (serverLogin.success && serverLogin.user) {
        const curUsers = StorageService.getUsers();
        if (!curUsers.some((u) => u.id === serverLogin.user!.id)) {
          curUsers.push(serverLogin.user);
          StorageService.saveUsers(curUsers);
        }
        StorageService.setCurrentUserId(serverLogin.user.id);
        onSuccess(serverLogin.user);
        return;
      }
    } catch {
      // Continue
    }

    // If user is truly not found
    setError(`No registered account found with "${userId}". Please verify your credentials or click "Create Account" to register.`);
  };

  const handleReactivate = () => {
    if (!inactiveUser) return;
    StorageService.reactivateUserAccount(inactiveUser.id);
    const updated = StorageService.getUserById(inactiveUser.id);
    if (updated) {
      StorageService.setCurrentUserId(updated.id);
      onSuccess(updated);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 relative z-10">
      {/* Exact card layout matching Screenshot_20260927_223000.jpg */}
      <div className="w-full max-w-md bg-[#0a0f18]/95 border border-slate-800/90 rounded-[32px] p-7 sm:p-9 shadow-2xl backdrop-blur-xl relative">
        
        {/* Top Account Icon in square dark box */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0e1626] border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/40">
            <ShieldCheck className="w-7 h-7 text-[#65ff00]" />
          </div>
        </div>

        {/* Header Typography */}
        <div className="text-center mb-6">
          <p className="text-[12px] font-bold text-slate-400 tracking-[0.2em] uppercase font-mono mb-1">
            METAL • SPACE
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Account login
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Enter your account credentials to continue.
          </p>
        </div>

        {/* Top small green pill: LOGIN */}
        <div className="mb-6">
          <div className="w-full py-2.5 rounded-xl bg-[#65ff00] text-black font-extrabold text-xs tracking-wider text-center uppercase shadow-md shadow-[#65ff00]/15">
            LOGIN
          </div>
        </div>

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-5 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            {inactiveUser && (
              <button
                type="button"
                onClick={handleReactivate}
                className="mt-1 w-full py-1.5 rounded-lg bg-[#65ff00] text-black font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Reactivate Account Now
              </button>
            )}
          </div>
        )}

        {/* Form Inputs matching screenshot */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* USER ID */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              USER ID
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <UserIcon className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter user ID / Gmail"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#060a12] border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-[#65ff00] focus:ring-1 focus:ring-[#65ff00] outline-none transition-all"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
              PASSWORD
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#060a12] border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-[#65ff00] focus:ring-1 focus:ring-[#65ff00] outline-none transition-all"
              />
            </div>
          </div>

          {/* Action Buttons: Open Account (লগইন/ঢুকুন) and Create Account (ক্রিয়েট একাউন্ট) side by side */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button
              type="submit"
              className="py-3.5 px-3 rounded-2xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-xs sm:text-sm shadow-xl shadow-[#65ff00]/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
              title="Open Account / Log In"
            >
              <span>Open Account</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsRegisterOpen(true);
              }}
              className="py-3.5 px-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-800 text-white font-bold text-xs sm:text-sm border border-slate-700 hover:border-emerald-500/50 shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99]"
              title="Create New Account"
            >
              <UserPlus className="w-4 h-4 text-[#65ff00]" />
              <span>Create Account</span>
            </button>
          </div>
        </form>

        {/* FORGOT PASSWORD SECTION */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <button
            type="button"
            onClick={() => {
              setError(null);
              setIsForgotPasswordOpen(true);
            }}
            className="text-xs text-slate-400 hover:text-[#65ff00] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 group"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#65ff00] group-hover:rotate-45 transition-transform" />
            <span>Forgot Password</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal (User resets password using their User ID) */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        onSuccess={(email, newPass) => {
          setUserId(email);
          setPassword(newPass);
          setSuccessNotice('Password successfully changed! Click "Open Account" to continue.');
        }}
        initialUserId={userId.trim()}
      />

      {/* Register Modal for Create Account */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(newUser) => {
          setIsRegisterOpen(false);
          setUserId(newUser.email);
          setPassword(newUser.password || '');
          onSuccess(newUser);
        }}
        onSwitchToLogin={() => setIsRegisterOpen(false)}
        isAdmin={false}
      />
    </div>
  );
};
