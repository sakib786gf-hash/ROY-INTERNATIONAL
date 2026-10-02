import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import { StorageService, DEFAULT_ADMIN } from '../../services/storage';
import { User } from '../../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToRegister: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inactiveUser, setInactiveUser] = useState<User | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInactiveUser(null);

    const cleanEmail = email.trim().toLowerCase();

    // Check Admin Credentials from Prompt:
    // Username/Email: izaz786@metal.com
    // Password: Izaz@123
    if (cleanEmail === 'izaz786@metal.com') {
      if (password === 'Izaz@123') {
        const adminUser = StorageService.getUserByEmail('izaz786@metal.com') || DEFAULT_ADMIN;
        StorageService.setCurrentUserId(adminUser.id);
        onSuccess(adminUser);
        onClose();
        return;
      } else {
        setError('Incorrect password for Izaz Admin. (Default: Izaz@123)');
        return;
      }
    }

    // Check other registered users
    const user = StorageService.getUserByEmail(cleanEmail);
    if (!user) {
      setError('No registered account found with this email address.');
      return;
    }

    // Verify user password
    if (user.password) {
      if (user.password !== password) {
        setError('Incorrect password. Please verify your password and try again.');
        return;
      }
    } else {
      if (password !== 'User@123' && password !== 'Sakib@123' && password !== 'Izaz@123') {
        setError('Incorrect password. Please enter the password you registered with.');
        return;
      }
    }

    // If deleted
    if (user.isDeleted) {
      setError('This account was permanently deleted.');
      return;
    }

    // Inactive users can log in and view dashboard
    StorageService.setCurrentUserId(user.id);
    onSuccess(user);
    onClose();
  };

  const handleReactivate = () => {
    if (!inactiveUser) return;
    StorageService.reactivateUserAccount(inactiveUser.id);
    const updated = StorageService.getUserById(inactiveUser.id);
    if (updated) {
      StorageService.setCurrentUserId(updated.id);
      onSuccess(updated);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel-glow">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold font-heading text-white">Sign In to Metal Wallet</h2>
          <p className="text-xs text-slate-400 mt-1">
            Access your secure simulated INR balance & banking terminal
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{error}</p>
              {inactiveUser && (
                <button
                  type="button"
                  onClick={handleReactivate}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs shadow cursor-pointer transition-all"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Reactivate My Account Now
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Username or Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="izaz786@metal.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-sm text-white placeholder-slate-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Sign In to Terminal</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToRegister();
              }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold cursor-pointer underline ml-1"
            >
              Register with KYC Details
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
