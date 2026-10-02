import React, { useState } from 'react';
import {
  Wallet,
  Key,
  RotateCw,
  History as HistoryIcon,
  User as UserIcon,
  Shield,
  Bell,
  LogOut,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  Building2,
  Mail,
  Home,
  ChevronRight
} from 'lucide-react';
import { User, Transaction, WithdrawalRequest } from '../../types';
import { StorageService } from '../../services/storage';
import { numberToIndianWords } from '../../utils/numberToWords';

// Clean user-facing text to ensure no admin terms appear anywhere in user portal
function sanitizeUserText(text: string): string {
  if (!text) return '';
  return text
    .replace(/admin\s*app\s*group/gi, 'Direct Transfer')
    .replace(/admin\s*add\s*money/gi, 'Wallet Deposit')
    .replace(/admin\s*add\s*funds/gi, 'Wallet Deposit')
    .replace(/admin\s*deposit/gi, 'Wallet Deposit')
    .replace(/admin\s*approve[d]?/gi, 'Completed')
    .replace(/admin\s*approval/gi, 'Completed')
    .replace(/admin\s*admit/gi, 'Completed')
    .replace(/pending\s*admit/gi, 'Completed')
    .replace(/admin\s*inactive/gi, 'Inactive')
    .replace(/admin\s*de-?active/gi, 'Inactive')
    .replace(/admin\s*bonus\s*top-up/gi, 'Bonus Deposit')
    .replace(/admin\s*top-up\s*grant/gi, 'Wallet Credit')
    .replace(/admin\s*balance\s*top-up/gi, 'Wallet Credit')
    .replace(/admin\s*grant/gi, 'Wallet Credit')
    .replace(/pending\s*admin\s*approval/gi, 'Processing')
    .replace(/pending\s*admin\s*review/gi, 'Processing')
    .replace(/money\s*pending\s*approve[d]?/gi, 'Pending')
    .replace(/pending\s*approve[d]?/gi, 'Pending')
    .replace(/মানি\s*পেন্ডিং\s*এপ্রুভ/gi, 'পেন্ডিং')
    .replace(/super\s*admin/gi, 'System')
    .replace(/person\s*to\s*person/gi, 'Transfer')
    .replace(/send\s*money/gi, 'Transfer')
    .replace(/p2p/gi, 'Transfer')
    .replace(/by\s*admin/gi, '')
    .replace(/admin/gi, '')
    .trim();
}

interface UserDashboardProps {
  currentUser: User;
  transactions: Transaction[];
  withdrawals: WithdrawalRequest[];
  onOpenWithdraw: () => void;
  onRefreshData: () => void;
  onLogout: () => void;
  onOpenNotifications: () => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentUser,
  transactions,
  withdrawals,
  onOpenWithdraw,
  onRefreshData,
  onLogout,
  onOpenNotifications,
}) => {
  const [activeBottomTab, setActiveBottomTab] = useState<'home' | 'history' | 'notice' | 'gmail' | 'profile'>('home');
  const [showPinModal, setShowPinModal] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [pinSuccess, setPinSuccess] = useState(false);
  const [newPin, setNewPin] = useState('');

  // User's transactions and withdrawals sorted newest first
  const userTransactions = [...transactions]
    .filter((t) => t.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const userWithdrawals = [...withdrawals]
    .filter((w) => w.userId === currentUser.id)
    .sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  const latestWithdrawal = userWithdrawals[0];

  const isActive = currentUser.isActive && !currentUser.isDeleted;

  // Handle Withdraw click: if inactive, block withdrawal and show exact user notice
  const handleWithdrawClick = () => {
    if (!isActive) {
      setShowBlockedModal(true);
      return;
    }
    onOpenWithdraw();
  };

  // Helper for rendering transaction status badges
  const renderStatusBadge = (tx: Transaction) => {
    if (tx.status === 'pending') {
      return (
        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
          PENDING
        </span>
      );
    }
    if (tx.status === 'failed' || tx.status === 'refunded') {
      return (
        <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-bold">
          FAILED
        </span>
      );
    }
    return (
      <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold">
        SUCCESS
      </span>
    );
  };

  // Helper for rendering clear transaction descriptions
  const getTransactionTitle = (tx: Transaction) => {
    if (tx.type === 'withdrawal') {
      if (tx.status === 'completed') {
        return 'Withdrawal Successful';
      }
      if (tx.status === 'failed' || tx.status === 'refunded') {
        return 'Withdrawal Failed';
      }
      if (tx.status === 'pending') {
        return sanitizeUserText(tx.description) || 'Bank Withdrawal';
      }
    }
    return sanitizeUserText(tx.description);
  };

  const handleChangePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPin || newPin.length < 4) return;
    setPinSuccess(true);
    setTimeout(() => {
      setPinSuccess(false);
      setShowPinModal(false);
      setNewPin('');
    }, 1200);
  };

  return (
    <div className="w-full max-w-md mx-auto min-h-screen pb-24 px-4 pt-4 sm:pt-6 font-sans relative z-10">
      {/* TOP HEADER ROW */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {/* User ID pill - User requested: "আইডির রং সম্পূর্ণ চেঞ্জ হয়ে যাবে রেড কালার হয়ে যাবে একটিভ হলে সবুজ কালার হয়ে যাবে।" */}
        <div
          className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold truncate max-w-[240px] sm:max-w-[280px] border transition-all ${
            isActive
              ? 'bg-[#06240d] text-[#65ff00] border-[#65ff00]/60 shadow-sm shadow-[#65ff00]/15'
              : 'bg-[#260a0d] text-rose-500 border-rose-600/60 shadow-sm shadow-rose-500/15'
          }`}
        >
          <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-[#65ff00]' : 'bg-rose-500 animate-pulse'}`} />
          <UserIcon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-[#65ff00]' : 'text-rose-500'}`} />
          <span className="truncate">{currentUser.email}</span>
        </div>

        {/* Right action icons */}
        <div className="flex items-center gap-1.5">
          {/* Bell Icon */}
          <button
            onClick={onOpenNotifications}
            className="w-8 h-8 rounded-full bg-[#0c121e] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-3.5 h-3.5" />
          </button>

          {/* Refresh Icon */}
          <button
            onClick={onRefreshData}
            className="w-8 h-8 rounded-full bg-[#0c121e] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Refresh"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>

          {/* Logout Icon */}
          <button
            onClick={onLogout}
            className="w-8 h-8 rounded-full bg-[#0c121e] border border-slate-800 flex items-center justify-center text-slate-400 hover:text-red-400 transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SUBTITLE & GREETING */}
      <div className="mb-4">
        <p className="text-[11px] font-bold text-slate-400 tracking-[0.2em] uppercase font-mono">
          METAL • SPACE
        </p>
        <h1 className="text-3xl sm:text-4xl font-serif text-white font-normal mt-0.5 tracking-tight">
          Good day
        </h1>
      </div>

      {/* TOTAL BALANCE CARD (MATCHING SCREENSHOT) - NOTE: User cannot add money */}
      <div className="bg-[#0a0f18]/95 border border-slate-800/90 rounded-[24px] p-5 sm:p-6 mb-3 shadow-xl relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase font-mono">
            TOTAL BALANCE
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#65ff00] text-[#65ff00]">
            LIVE
          </span>
        </div>

        {/* Big Balance Amount in ₹ INR */}
        <div className="text-4xl sm:text-5xl font-bold font-sans text-white tracking-tight my-2">
          ₹ {currentUser.balance.toLocaleString('en-IN')}
        </div>

        {/* Amount in words */}
        <p className="text-[10px] sm:text-[11px] font-mono font-semibold text-slate-400 tracking-wide mb-4">
          WALLET AMOUNT IN WORDS: {numberToIndianWords(currentUser.balance)}
        </p>

        {/* Badges row: SECURED and METAL (No User Add Money Button) */}
        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#121926] border border-slate-700/60 text-slate-300 text-xs font-medium">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>SECURED</span>
          </div>

          <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#65ff00] text-black text-xs font-bold shadow-md shadow-[#65ff00]/15">
            <span className="w-2 h-2 rounded-full bg-black" />
            <span>METAL</span>
          </div>
        </div>
      </div>

      {/* WITHDRAWAL STATUS BANNER ON USER DASHBOARD */}
      {latestWithdrawal && (
        <div
          className={`p-3.5 rounded-[22px] mb-3 flex items-center justify-between gap-3 border shadow-xl backdrop-blur-xl transition-all ${
            latestWithdrawal.status === 'approved'
              ? 'bg-[#06180e]/95 border-emerald-500/60 text-emerald-300 shadow-emerald-950/40'
              : latestWithdrawal.status === 'rejected'
              ? 'bg-[#180608]/95 border-rose-500/60 text-rose-300 shadow-rose-950/40'
              : 'bg-[#181306]/95 border-amber-500/60 text-amber-300 shadow-amber-950/40'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                latestWithdrawal.status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : latestWithdrawal.status === 'rejected'
                  ? 'bg-rose-500/20 text-rose-400'
                  : 'bg-amber-500/20 text-amber-400 animate-pulse'
              }`}
            >
              {latestWithdrawal.status === 'approved' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              ) : latestWithdrawal.status === 'rejected' ? (
                <XCircle className="w-5 h-5 text-rose-400" />
              ) : (
                <Clock className="w-5 h-5 text-amber-400" />
              )}
            </div>

            <div className="min-w-0">
              <h4 className="text-sm font-bold text-white tracking-wide truncate">
                {latestWithdrawal.status === 'approved'
                  ? 'Withdrawal Successful'
                  : latestWithdrawal.status === 'rejected'
                  ? 'Withdrawal Failed'
                  : 'Withdrawal Pending'}
              </h4>
              <p className="text-[11px] text-slate-300 font-mono truncate">
                ₹{latestWithdrawal.amount.toLocaleString('en-IN')} • {latestWithdrawal.bankDetails.bankName}
                {latestWithdrawal.status === 'rejected' ? ' (Funds Returned)' : ''}
              </p>
            </div>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase shrink-0 border ${
              latestWithdrawal.status === 'approved'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : latestWithdrawal.status === 'rejected'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}
          >
            {latestWithdrawal.status === 'approved'
              ? 'Successful'
              : latestWithdrawal.status === 'rejected'
              ? 'Failed'
              : 'Pending'}
          </span>
        </div>
      )}

      {/* ACTION BUTTONS GRID MATCHING SCREENSHOT */}
      <div className="grid grid-cols-5 gap-2 mb-3">
        {/* 1. Withdraw (Vibrant Lime Green active button) */}
        <button
          onClick={handleWithdrawClick}
          className="bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold rounded-[20px] py-3.5 px-1 flex flex-col items-center justify-center gap-1.5 text-xs shadow-lg shadow-[#65ff00]/20 cursor-pointer transition-transform active:scale-95"
        >
          <Wallet className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[11px] font-bold leading-tight">Withdraw</span>
        </button>

        {/* 2. ChangePin */}
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-[#0a0f18] hover:bg-[#111928] border border-slate-800 text-slate-300 rounded-[20px] py-3.5 px-1 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer transition-colors"
        >
          <Key className="w-5 h-5 text-slate-400" />
          <span className="text-[10px] sm:text-[11px] font-medium leading-tight">ChangePin</span>
        </button>

        {/* 3. Refresh */}
        <button
          onClick={onRefreshData}
          className="bg-[#0a0f18] hover:bg-[#111928] border border-slate-800 text-slate-300 rounded-[20px] py-3.5 px-1 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer transition-colors"
        >
          <RotateCw className="w-5 h-5 text-slate-400" />
          <span className="text-[11px] font-medium leading-tight">Refresh</span>
        </button>

        {/* 4. History */}
        <button
          onClick={() => setActiveBottomTab('history')}
          className="bg-[#0a0f18] hover:bg-[#111928] border border-slate-800 text-slate-300 rounded-[20px] py-3.5 px-1 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer transition-colors"
        >
          <HistoryIcon className="w-5 h-5 text-slate-400" />
          <span className="text-[11px] font-medium leading-tight">History</span>
        </button>

        {/* 5. Account (Personal Details) */}
        <button
          onClick={() => setActiveBottomTab('profile')}
          className="bg-[#0a0f18] hover:bg-[#111928] border border-slate-800 text-slate-300 rounded-[20px] py-3.5 px-1 flex flex-col items-center justify-center gap-1.5 text-xs cursor-pointer transition-colors"
        >
          <UserIcon className="w-5 h-5 text-slate-400" />
          <span className="text-[11px] font-medium leading-tight">Account</span>
        </button>
      </div>

      {/* TRANSACTIONS SECTION MATCHING SCREENSHOT */}
      <div className="bg-[#0a0f18]/95 border border-slate-800/90 rounded-[20px] p-5 shadow-lg mb-6">
        {userTransactions.length === 0 ? (
          <div className="text-white text-base font-medium py-1">
            No transtion!
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Recent Transitions
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {userTransactions.length} recorded
              </span>
            </div>

            <div className="space-y-2.5">
              {userTransactions.slice(0, 5).map((tx) => {
                const isCredit = tx.type === 'credit' || tx.type === 'transfer_in' || tx.type === 'admin_grant';
                return (
                  <div
                    key={tx.id}
                    className="p-3 rounded-xl bg-[#060a12] border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{getTransactionTitle(tx)}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className={`font-mono font-bold ${isCredit ? 'text-[#65ff00]' : 'text-slate-100'}`}>
                        {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                      </p>
                      {renderStatusBadge(tx)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* PIN CHANGE MODAL */}
      {showPinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xs bg-[#0a0f18] border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Key className="w-5 h-5 text-[#65ff00]" />
              Change Wallet PIN
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Enter your new 4-digit simulated transaction PIN.
            </p>

            {pinSuccess && (
              <div className="p-2 rounded-xl bg-[#65ff00]/15 text-[#65ff00] text-xs font-semibold mb-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                PIN Updated Successfully!
              </div>
            )}

            <form onSubmit={handleChangePinSubmit} className="space-y-3">
              <input
                type="password"
                maxLength={4}
                required
                value={newPin}
                onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                placeholder="••••"
                className="w-full text-center tracking-widest text-2xl py-2 rounded-xl bg-black border border-slate-800 text-white outline-none focus:border-[#65ff00]"
              />
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="w-1/2 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2 rounded-xl bg-[#65ff00] text-black text-xs font-bold cursor-pointer"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* USER ACCOUNT DOSSIER MODAL - ONLY USER'S OWN DETAILS (Rule 5: No active/inactive toggle in profile) */}
      {activeBottomTab === 'profile' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-sm bg-[#0a0f18] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Account Details</h3>
                <p className="text-[11px] text-slate-400">Personal & Linked Bank Details</p>
              </div>
              <button
                onClick={() => setActiveBottomTab('home')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer p-1"
              >
                ✕ Close
              </button>
            </div>

            {/* Personal Dossier */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-xl bg-black border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Full Name:</span>
                <span className="font-bold text-white text-sm">{currentUser.fullName}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Phone Number:</span>
                <span className="font-mono font-bold text-white">{currentUser.phone}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Aadhaar (12 Digits):</span>
                <span className="font-mono font-bold text-cyan-300">{currentUser.aadhaarNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-slate-800">
                <span className="text-slate-500 text-[10px] block">PAN Number:</span>
                <span className="font-mono font-bold text-amber-300 uppercase">{currentUser.panNumber}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-black border border-slate-800">
                <span className="text-slate-500 text-[10px] block">Bank Details (Withdrawal):</span>
                <span className="font-semibold text-white">{currentUser.bankDetails.bankName}</span>
                <span className="block text-[11px] text-slate-300 mt-0.5">
                  Holder: {currentUser.bankDetails.accountHolderName}
                </span>
                <span className="block text-[11px] text-slate-400 font-mono mt-0.5">
                  A/C: {currentUser.bankDetails.accountNumber} • IFSC: {currentUser.bankDetails.ifscCode}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[10px] font-mono">
                  {currentUser.bankDetails.accountType}
                </span>
              </div>
            </div>

            <button
              onClick={() => setActiveBottomTab('home')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* USER TRANSACTION HISTORY MODAL (Clean user view without admin terms) */}
      {activeBottomTab === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in overflow-y-auto">
          <div className="w-full max-w-md bg-[#0a0f18] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 my-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">Transaction History</h3>
                <p className="text-[11px] text-slate-400">All recorded transactions</p>
              </div>
              <button
                onClick={() => setActiveBottomTab('home')}
                className="text-xs text-slate-400 hover:text-white cursor-pointer p-1"
              >
                ✕ Close
              </button>
            </div>

            {userTransactions.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No transactions recorded yet.
              </div>
            ) : (
              <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
                {userTransactions.map((tx) => {
                  const isCredit = tx.type === 'credit' || tx.type === 'transfer_in' || tx.type === 'admin_grant';
                  return (
                    <div
                      key={tx.id}
                      className="p-3 rounded-2xl bg-[#060a12] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">{getTransactionTitle(tx)}</p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Ref: {tx.referenceId} • {new Date(tx.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`font-mono font-bold ${isCredit ? 'text-[#65ff00]' : 'text-slate-100'}`}>
                          {isCredit ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                        </p>
                        {renderStatusBadge(tx)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <button
              onClick={() => setActiveBottomTab('home')}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* FIXED BOTTOM NAVIGATION BAR MATCHING Screenshot_20260920_223609.jpg */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#070b13]/95 border-t border-slate-800/90 py-2 px-3 flex items-center justify-around z-40 backdrop-blur-xl">
        {/* Home */}
        <button
          onClick={() => setActiveBottomTab('home')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition-colors ${
            activeBottomTab === 'home' ? 'text-[#65ff00]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Home</span>
        </button>

        {/* History */}
        <button
          onClick={() => {
            setActiveBottomTab('history');
            onRefreshData();
          }}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition-colors ${
            activeBottomTab === 'history' ? 'text-[#65ff00]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <HistoryIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">History</span>
        </button>

        {/* Notice */}
        <button
          onClick={() => {
            setActiveBottomTab('notice');
            onOpenNotifications();
          }}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition-colors relative ${
            activeBottomTab === 'notice' ? 'text-[#65ff00]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Bell className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Notice</span>
        </button>

        {/* Gmail / Support */}
        <button
          onClick={() => {
            setActiveBottomTab('gmail');
            alert(`Support Desk: Contact Help Center at support@metal.space or call +91 98321 00786`);
          }}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition-colors ${
            activeBottomTab === 'gmail' ? 'text-[#65ff00]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Mail className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Gmail</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => setActiveBottomTab('profile')}
          className={`flex flex-col items-center gap-1 p-1 cursor-pointer transition-colors ${
            activeBottomTab === 'profile' ? 'text-[#65ff00]' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] font-medium leading-none">Profile</span>
        </button>
      </nav>

      {/* BLOCKED / INACTIVE WITHDRAWAL NOTICE MODAL */}
      {showBlockedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0c121e] border border-rose-500/50 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                ID Inactive
              </h3>
              <p className="text-xs text-slate-300 mt-2">
                Withdrawals cannot be processed because this account ID is currently inactive.
              </p>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowBlockedModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
