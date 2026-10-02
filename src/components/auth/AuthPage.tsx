import React, { useState } from 'react';
import { Wallet, User as UserIcon, Lock, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { StorageService, DEFAULT_ADMIN } from '../../services/storage';
import { User } from '../../types';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onOpenRegister: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onSuccess, onOpenRegister }) => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [inactiveUser, setInactiveUser] = useState<User | null>(null);

  // Quick fill helper
  const handleQuickFill = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setUserId('izaz786@metal.com');
      setPassword('Izaz@123');
    } else {
      setUserId('sakib786gf@gmail.com');
      setPassword('User@123');
    }
    setError(null);
    setInactiveUser(null);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInactiveUser(null);

    const cleanInput = userId.trim().toLowerCase();

    // Check Admin Credentials from Prompt Specification:
    // Username/Email: izaz786@metal.com
    // Password: Izaz@123
    if (cleanInput === 'izaz786@metal.com' || cleanInput === 'izaz786' || cleanInput === 'admin') {
      if (password === 'Izaz@123') {
        const adminUser = StorageService.getUserByEmail('izaz786@metal.com') || DEFAULT_ADMIN;
        StorageService.setCurrentUserId(adminUser.id);
        onSuccess(adminUser);
        return;
      } else {
        setError('Incorrect password for Izaz Admin. (Password: Izaz@123)');
        return;
      }
    }

    // Check other registered users
    const allUsers = StorageService.getUsers();
    const user = allUsers.find(
      (u) =>
        u.email.toLowerCase() === cleanInput ||
        (cleanInput === 'sakib786' && u.email.toLowerCase().includes('sakib')) ||
        u.phone.replace(/\D/g, '') === cleanInput.replace(/\D/g, '') ||
        u.id.toLowerCase() === cleanInput
    );

    if (!user) {
      setError('No registered account found with this User ID. Please check or register.');
      return;
    }

    // If user account is permanently deleted
    if (user.isDeleted) {
      setError('No registered account found with this User ID. Please check or register.');
      return;
    }

    // Verify Password
    if (user.password && user.password !== password) {
      setError('Incorrect password. Please check and enter the correct password.');
      return;
    }

    // Inactive users can also log in and view dashboard as requested
    StorageService.setCurrentUserId(user.id);
    onSuccess(user);
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
        
        {/* Top Wallet Icon in square dark box */}
        <div className="flex justify-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0e1626] border border-slate-700/60 flex items-center justify-center shadow-lg shadow-black/40">
            <Wallet className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Header Typography */}
        <div className="text-center mb-6">
          <p className="text-[12px] font-bold text-slate-400 tracking-[0.2em] uppercase font-mono mb-1">
            METAL • SPACE
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal tracking-tight">
            Wallet login
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Enter your wallet credentials to continue.
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
                Reactivate Wallet Now
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
                placeholder="Enter user ID"
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

          {/* Big Neon Green Button: Open Wallet → */}
          <button
            type="submit"
            className="w-full mt-3 py-3.5 px-4 rounded-2xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-sm shadow-xl shadow-[#65ff00]/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <span>Open Wallet</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        {/* Footer Registration Link */}
        <div className="mt-6 text-center pt-4 border-t border-slate-800/80">
          <p className="text-xs text-slate-400">
            Need an Indian KYC account?{' '}
            <button
              type="button"
              onClick={onOpenRegister}
              className="text-[#65ff00] hover:underline font-semibold cursor-pointer ml-1"
            >
              Create New Wallet
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
