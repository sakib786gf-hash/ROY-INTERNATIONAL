import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Bell,
  LogOut,
  ChevronDown,
  RefreshCw,
  Wallet,
  Sparkles,
  User as UserIcon,
  CreditCard
} from 'lucide-react';
import { User, NotificationItem } from '../../types';
import { StorageService } from '../../services/storage';

interface NavbarProps {
  currentUser: User;
  allUsers: User[];
  notifications: NotificationItem[];
  onSelectUser: (user: User) => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onOpenNotifications: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  allUsers,
  notifications,
  onSelectUser,
  onOpenLogin,
  onOpenRegister,
  onOpenNotifications,
  onResetData,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3">
          <div className="relative group flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-sky-600 to-indigo-700 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Wallet className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-lg sm:text-xl font-bold tracking-tight text-white flex items-center">
                METAL
                <span className="text-cyan-400 font-extrabold ml-1">WALLET</span>
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
                ₹ INR
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono tracking-wider flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-cyan-400" />
              SIMULATED INDIA WALLET
            </span>
          </div>
        </div>

        {/* Center / Currency & Status badge */}
        <div className="hidden md:flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700/60 flex items-center gap-2 text-xs text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium">RBI Virtual Simulated Network</span>
            <span className="text-slate-500">|</span>
            <span className="font-mono text-cyan-300 font-bold">100% INR</span>
          </div>

          {currentUser.role === 'admin' ? (
            <div className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5 text-xs text-amber-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>SUPER ADMIN PORTAL</span>
            </div>
          ) : (
            <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-1.5 text-xs text-cyan-300 font-medium">
              <UserCheck className="w-3.5 h-3.5" />
              <span>USER DASHBOARD</span>
            </div>
          )}
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile / Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 transition-all cursor-pointer"
            >
              <img
                src={currentUser.photoUrl}
                alt={currentUser.fullName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-600 shadow"
                onError={(e) => {
                  // Fallback avatar
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.fullName)}&background=0284c7&color=fff`;
                }}
              />
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-white leading-tight flex items-center gap-1">
                  {currentUser.fullName}
                  {currentUser.role === 'admin' && (
                    <span className="text-[9px] bg-amber-400/20 text-amber-300 border border-amber-400/30 px-1 rounded uppercase font-bold">
                      Admin
                    </span>
                  )}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  {currentUser.isActive ? 'Active' : 'Inactive'} • {StorageService.formatINR(currentUser.balance)}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Menu Popover */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 glass-panel animate-in fade-in">
                {/* Active user details */}
                <div className="p-3.5 bg-slate-950/60 border-b border-slate-800">
                  <p className="text-[11px] text-slate-400 uppercase font-mono tracking-wider">Signed In As</p>
                  <p className="font-semibold text-sm text-white truncate">{currentUser.fullName}</p>
                  <p className="text-xs text-cyan-400 font-mono truncate">{currentUser.email}</p>
                  <div className="mt-2 flex items-center justify-between text-xs pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400">Account Type:</span>
                    <span className="font-bold text-white font-mono">
                      {currentUser.role === 'admin' ? 'System Administrator (No Wallet)' : StorageService.formatINR(currentUser.balance)}
                    </span>
                  </div>
                </div>

                {/* Quick Account Switcher (For easy demo testing of Admin vs User view) */}
                <div className="p-2 border-b border-slate-800">
                  <p className="text-[10px] text-slate-400 font-mono px-2 py-1 uppercase tracking-wider">
                    Quick Switch Account (Demo)
                  </p>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSelectUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          u.id === currentUser.id
                            ? 'bg-cyan-500/15 text-cyan-300 font-semibold border border-cyan-500/30'
                            : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={u.photoUrl}
                            alt={u.fullName}
                            className="w-5 h-5 rounded object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=334155&color=fff`;
                            }}
                          />
                          <span className="truncate">{u.fullName}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {u.role === 'admin' ? '👑 Admin' : u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenLogin();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <UserIcon className="w-3.5 h-3.5 text-cyan-400" />
                    Sign In with Password
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenRegister();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
                    Register New User (KYC)
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onResetData();
                    }}
                    className="w-full flex items-center gap-2 p-2 rounded-lg text-left text-xs text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Reset Initial Mock Data
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
