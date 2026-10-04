import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { CloudSync } from '../../services/cloudSync';
import { User } from '../../types';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, newPass: string) => void;
  initialUserId?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialUserId = '',
}) => {
  const [userIdInput, setUserIdInput] = useState(initialUserId);
  const [matchedUser, setMatchedUser] = useState<User | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUserIdInput(initialUserId);
      setMatchedUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setError(null);
      setSuccessMsg(null);

      // Auto-lookup if initialUserId is provided
      if (initialUserId.trim()) {
        const clean = initialUserId.trim().toLowerCase();
        const users = StorageService.getUsers();
        const found = users.find(
          (u) =>
            u.email.toLowerCase() === clean ||
            u.id.toLowerCase() === clean ||
            (u.phone && u.phone.replace(/\D/g, '').endsWith(clean.replace(/\D/g, '')))
        );
        if (found) {
          setMatchedUser(found);
        }
      }
    }
  }, [isOpen, initialUserId]);

  if (!isOpen) return null;

  // Step 1: Look up user by User ID / Email
  const handleVerifyUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const clean = userIdInput.trim().toLowerCase();
    if (!clean) {
      setError('Please enter your User ID or Gmail.');
      return;
    }

    const allUsers = StorageService.getUsers();
    const cleanDigits = clean.replace(/\D/g, '');

    const found = allUsers.find((u) => {
      if (u.role === 'admin') {
        // Admin password reset
        return (
          u.email.toLowerCase() === clean ||
          clean === 'izaz786' ||
          clean === 'admin' ||
          clean === 'izaz'
        );
      }
      const uEmail = u.email.toLowerCase().trim();
      const uUsername = uEmail.split('@')[0];
      const uPhoneDigits = u.phone?.replace(/\D/g, '') || '';
      const uAadhaarDigits = u.aadhaarNumber?.replace(/\D/g, '') || '';

      return (
        uEmail === clean ||
        uUsername === clean ||
        (cleanDigits.length === 10 && uPhoneDigits.endsWith(cleanDigits)) ||
        (cleanDigits.length === 12 && uAadhaarDigits === cleanDigits) ||
        u.id.toLowerCase() === clean
      );
    });

    if (!found) {
      setError(`No account found for User ID "${userIdInput}". Please enter a valid ID.`);
      return;
    }

    if (found.isDeleted) {
      setError('This account has been permanently deleted by the Administrator.');
      return;
    }

    setMatchedUser(found);
  };

  // Step 2: Reset Password and update everywhere
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matchedUser) return;
    setError(null);

    if (!newPassword || newPassword.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please verify and re-type.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Update in local storage
      StorageService.updateUser(matchedUser.id, {
        password: newPassword.trim(),
        updatedAt: new Date().toISOString(),
      });

      // 2. Push immediately to Cloud database and server
      const allUsers = StorageService.getUsers();
      await CloudSync.pushAllToServer({
        users: allUsers,
        transactions: StorageService.getTransactions(),
        withdrawals: StorageService.getWithdrawals(),
        notifications: StorageService.getNotifications(),
      });

      setSuccessMsg('Password has been successfully changed!');

      setTimeout(() => {
        setIsSubmitting(false);
        onSuccess(matchedUser.email, newPassword.trim());
        onClose();
      }, 1400);
    } catch {
      setIsSubmitting(false);
      setError('Failed to update password. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-[#0a0f18] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#0e1626] border border-[#65ff00]/40 flex items-center justify-center shadow-lg shadow-[#65ff00]/10 shrink-0">
            <KeyRound className="w-6 h-6 text-[#65ff00]" />
          </div>
          <div>
            <h2 className="text-lg font-bold font-heading text-white">Forgot Password</h2>
            <p className="text-xs text-slate-400">Reset Account Password with your User ID</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successMsg}</span>
          </div>
        )}

        {/* Step 1: User Verification */}
        {!matchedUser ? (
          <form onSubmit={handleVerifyUser} className="space-y-4 pt-1">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                USER ID / GMAIL
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={userIdInput}
                  onChange={(e) => setUserIdInput(e.target.value)}
                  placeholder="Enter User ID / Gmail"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#060a12] border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-[#65ff00] focus:ring-1 focus:ring-[#65ff00] outline-none transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Enter the User ID or Gmail registered to your account.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-sm shadow-xl shadow-[#65ff00]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              <span>Verify User ID</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>
        ) : (
          /* Step 2: Set New Password */
          <form onSubmit={handleResetPassword} className="space-y-4 pt-1">
            {/* Matched User Card */}
            <div className="p-3 rounded-2xl bg-[#0e1626] border border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#65ff00]/15 border border-[#65ff00]/30 flex items-center justify-center text-[#65ff00] font-bold text-xs shrink-0 uppercase">
                  {matchedUser.fullName ? matchedUser.fullName.charAt(0) : 'U'}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white uppercase truncate">
                    {matchedUser.fullName}
                  </p>
                  <p className="text-[11px] text-[#65ff00] font-mono truncate">
                    ID: {matchedUser.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMatchedUser(null)}
                className="text-[10px] text-slate-400 hover:text-white underline shrink-0 cursor-pointer"
              >
                Change ID
              </button>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                NEW PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#060a12] border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-[#65ff00] focus:ring-1 focus:ring-[#65ff00] outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-400 tracking-wider uppercase mb-1.5">
                CONFIRM NEW PASSWORD
              </label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#060a12] border border-slate-800 text-sm text-white placeholder-slate-600 focus:border-[#65ff00] focus:ring-1 focus:ring-[#65ff00] outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-sm shadow-xl shadow-[#65ff00]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4 stroke-[2.5]" />
              <span>{isSubmitting ? 'Updating...' : 'Update Password'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
