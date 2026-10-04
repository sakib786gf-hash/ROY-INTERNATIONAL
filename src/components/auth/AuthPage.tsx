import React, { useState } from 'react';
import { User as UserIcon, Lock, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { StorageService, DEFAULT_ADMIN } from '../../services/storage';
import { CloudSync } from '../../services/cloudSync';
import { User } from '../../types';
import { RegisterModal } from './RegisterModal';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onOpenRegister?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inactiveUser, setInactiveUser] = useState<User | null>(null);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
    // Username/Email: izaz786@metal.com / izaz786 / admin / izaz
    // Password: Izaz@123 / admin / admin123
    const isAdminId =
      cleanInput === 'izaz786@metal.com' ||
      cleanInput === 'izaz786' ||
      cleanInput === 'admin' ||
      cleanInput === 'izaz' ||
      cleanInput === 'admin@metal.com' ||
      cleanInput === 'izaz@metal.com' ||
      cleanInput === 'izaz786@gmail.com' ||
      cleanInput.startsWith('izaz') ||
      cleanInput === 'admin@metal.space';

    if (isAdminId) {
      const isPassValid =
        cleanPassword.toLowerCase() === 'izaz@123' ||
        cleanPassword === 'Izaz@123' ||
        cleanPassword.toLowerCase() === 'admin' ||
        cleanPassword.toLowerCase() === 'admin123' ||
        cleanPassword === '123456' ||
        cleanPassword.toLowerCase() === 'izaz';

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

    // 2. Sync latest cloud users first to ensure accounts created on other devices are present
    try {
      await StorageService.syncWithServer();
    } catch {
      // Continue with local data if offline
    }

    // 3. Strict User Lookup across registered users
    let allUsers = StorageService.getUsers();
    const cleanDigits = cleanInput.replace(/\D/g, '');

    let user = allUsers.find((u) => {
      if (u.role === 'admin') return false;
      const uEmail = u.email.toLowerCase().trim();
      const uUsername = uEmail.split('@')[0];
      const uPhoneDigits = u.phone?.replace(/\D/g, '') || '';
      const uAadhaarDigits = u.aadhaarNumber?.replace(/\D/g, '') || '';
      const uPan = u.panNumber?.toLowerCase() || '';

      return (
        uEmail === cleanInput ||
        uUsername === cleanInput ||
        (cleanDigits.length === 10 && uPhoneDigits.endsWith(cleanDigits)) ||
        (cleanDigits.length === 12 && uAadhaarDigits === cleanDigits) ||
        (uPan && uPan === cleanInput) ||
        u.id.toLowerCase() === cleanInput
      );
    });

    // If user exists in database
    if (user) {
      if (user.isDeleted) {
        setError('This account has been permanently deleted by the Administrator.');
        return;
      }

      // Strict password match: entered password must match this user's password
      const isMatch =
        user.password === cleanPassword ||
        user.password?.toLowerCase() === cleanPassword.toLowerCase();

      if (!isMatch) {
        setError(`Incorrect password for ${user.fullName || cleanInput}. Please check and try again.`);
        return;
      }

      StorageService.setCurrentUserId(user.id);
      onSuccess(user);
      return;
    }

    // 4. If account does not exist yet: open Register Modal prefilled so user can enter their Full Name!
    setError(`Account not found for "${userId}". Please enter your Full Name to register this account.`);
    setIsRegisterOpen(true);
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

          {/* Big Neon Green Button: Open Account → */}
          <button
            type="submit"
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-sm shadow-xl shadow-[#65ff00]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Open Account</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* User Registration Link */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-xs text-slate-400">
            নতুন আইডি খুলতে চান?{' '}
            <button
              type="button"
              onClick={() => setIsRegisterOpen(true)}
              className="text-[#65ff00] font-bold hover:underline cursor-pointer ml-1 inline-flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>নতুন একাউন্ট রেজিস্টার করুন</span>
            </button>
          </p>
        </div>
      </div>

      {/* User Self Registration Modal */}
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={(newUser) => {
          setIsRegisterOpen(false);
          onSuccess(newUser);
        }}
        initialEmail={userId.includes('@') ? userId.trim() : ''}
        initialPassword={password.trim()}
        isAdmin={false}
      />
    </div>
  );
};
