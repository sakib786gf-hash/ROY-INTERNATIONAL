import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Building2,
  DollarSign,
  PlusCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownLeft,
  AlertCircle,
  RefreshCw,
  Power,
  CreditCard,
  Send,
  Eye,
  Check,
  MessageSquare,
  ArrowLeft,
  Trash2,
  LogOut
} from 'lucide-react';
import { User, WithdrawalRequest, Transaction, PlatformStats } from '../../types';
import { StorageService } from '../../services/storage';

interface AdminDashboardProps {
  currentUser: User;
  users: User[];
  withdrawals: WithdrawalRequest[];
  transactions: Transaction[];
  stats: PlatformStats;
  onRefreshData: () => void;
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  users,
  withdrawals,
  transactions,
  stats,
  onRefreshData,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'withdrawals' | 'transactions' | 'broadcast'>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');

  // Modal states for Admin Add Unlimited Funds
  const [selectedUserForTopUp, setSelectedUserForTopUp] = useState<User | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<string>('50000');
  const [topUpNote, setTopUpNote] = useState<string>('Super Admin Balance Grant');
  const [topUpSuccessMsg, setTopUpSuccessMsg] = useState<string | null>(null);

  // Modal states for Permanent Delete User Account
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  // Modal states for Withdrawal Approve/Reject
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [adminRemark, setAdminRemark] = useState<string>('');

  // User KYC drawer/modal
  const [viewingKycUser, setViewingKycUser] = useState<User | null>(null);

  // Broadcast notification state
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Filter only regular users
  const regularUsers = users.filter((u) => u.role === 'user');

  const filteredUsers = regularUsers.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.phone.includes(searchQuery) ||
      u.panNumber.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'active') return matchesSearch && u.isActive && !u.isDeleted;
    if (statusFilter === 'inactive') return matchesSearch && (!u.isActive || u.isDeleted);
    return matchesSearch;
  });

  const filteredWithdrawals = withdrawals.filter((w) => {
    if (withdrawalFilter === 'all') return true;
    return w.status === withdrawalFilter;
  });

  // Handle Admin Toggle User Active / Inactive
  const handleToggleUserStatus = (userId: string, currentStatus: boolean) => {
    StorageService.toggleUserStatus(userId, !currentStatus);
    onRefreshData();
  };

  // Handle Admin Unlimited Add Funds
  const handleExecuteTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForTopUp) return;

    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    const res = StorageService.adminAddFunds(selectedUserForTopUp.id, amount, topUpNote);
    if (res.success) {
      setTopUpSuccessMsg(`Successfully credited ${StorageService.formatINR(amount)} to ${selectedUserForTopUp.fullName}`);
      setTimeout(() => {
        setSelectedUserForTopUp(null);
        setTopUpSuccessMsg(null);
      }, 1000);
      onRefreshData();
    }
  };

  // Handle Withdrawal Decision (Approve / Reject)
  const handleProcessWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWithdrawal) return;

    if (actionType === 'approve') {
      StorageService.approveWithdrawalRequest(
        selectedWithdrawal.id,
        currentUser.email,
        adminRemark || 'Verified and approved by Super Admin'
      );
    } else {
      StorageService.rejectWithdrawalRequest(
        selectedWithdrawal.id,
        currentUser.email,
        adminRemark || 'Rejected by Super Admin. Funds refunded to wallet.'
      );
    }

    setSelectedWithdrawal(null);
    setAdminRemark('');
    onRefreshData();
  };

  // Handle Broadcast notification
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    StorageService.addNotification({
      userId: 'all',
      title: broadcastTitle,
      message: broadcastMessage,
      type: broadcastType,
    });

    setBroadcastSuccess(true);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setTimeout(() => setBroadcastSuccess(false), 3000);
    onRefreshData();
  };

  // Handle Permanent Delete User Account
  const handleExecutePermanentDelete = () => {
    if (!userToDelete) return;
    const userName = userToDelete.fullName;
    const userEmail = userToDelete.email;
    const res = StorageService.deleteUserPermanently(userToDelete.id);
    if (res.success) {
      setDeleteSuccessMsg(`User ${userName} (${userEmail}) was permanently deleted from this device.`);
      setUserToDelete(null);
      setTimeout(() => setDeleteSuccessMsg(null), 3500);
      onRefreshData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-in fade-in">
      {/* Top Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold font-heading text-white">
              Admin Operations Desk
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-bold uppercase border border-cyan-500/30">
              System Control
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Logged in as <strong className="text-amber-300">{currentUser.email}</strong> • Full control to manage users, add balances, process withdrawals, and permanently delete accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onRefreshData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={onLogout}
            className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-semibold flex items-center gap-1.5 border border-rose-500/30 cursor-pointer transition-colors"
            title="Log Out"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Delete Success Alert */}
      {deleteSuccessMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="font-semibold">{deleteSuccessMsg}</span>
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="border-b border-slate-800 flex items-center gap-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'users' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Users Directory & Balances ({regularUsers.length})
          {activeTab === 'users' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>

        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'withdrawals' ? 'text-amber-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Withdrawal Approval Desk ({withdrawals.length})</span>
          {stats.pendingWithdrawalsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-bold font-mono text-[10px] animate-pulse">
              {stats.pendingWithdrawalsCount} PENDING
            </span>
          )}
          {activeTab === 'withdrawals' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />}
        </button>

        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'transactions' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Platform Master Ledger ({transactions.length})
          {activeTab === 'transactions' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`pb-3 text-xs sm:text-sm font-semibold transition-all relative whitespace-nowrap cursor-pointer ${
            activeTab === 'broadcast' ? 'text-cyan-400' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Send Notification Bar Alert
          {activeTab === 'broadcast' && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400" />}
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY & CONTROLS */}
      {activeTab === 'users' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden glass-panel">
          {/* Controls Bar */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search user name, email, phone, PAN..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                <Filter className="w-3.5 h-3.5" />
                Filter:
              </span>
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({regularUsers.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'active'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Active ({stats.activeUsers})
              </button>
              <button
                onClick={() => setStatusFilter('inactive')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  statusFilter === 'inactive'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Inactive ({stats.inactiveUsers})
              </button>
            </div>
          </div>

          {/* Mobile Cards View (for mobile phones: block md:hidden) */}
          <div className="block md:hidden divide-y divide-slate-800/80">
            {filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No users match the search criteria.
              </div>
            ) : (
              filteredUsers.map((u) => {
                const isUserActive = u.isActive && !u.isDeleted;
                return (
                  <div key={u.id} className="p-4 space-y-3 bg-slate-900/40">
                    {/* User info & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.photoUrl}
                          alt={u.fullName}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-700 shadow"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=0284c7&color=fff`;
                          }}
                        />
                        <div>
                          <p className="font-bold text-white text-sm">{u.fullName}</p>
                          <p className="text-slate-400 font-mono text-[11px] truncate max-w-[170px]">{u.email}</p>
                          <p className="text-cyan-400 font-mono text-[11px]">{u.phone}</p>
                        </div>
                      </div>

                      {/* Status toggle pill */}
                      <button
                        onClick={() => handleToggleUserStatus(u.id, isUserActive)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 border transition-all cursor-pointer ${
                          isUserActive
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                        }`}
                        title="Click to toggle user status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isUserActive ? 'bg-emerald-400' : 'bg-rose-500'}`} />
                        <span>{isUserActive ? 'ACTIVE' : 'INACTIVE'}</span>
                      </button>
                    </div>

                    {/* User Financials & KYC */}
                    <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px]">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Wallet Balance</span>
                        <span className="font-bold font-mono text-cyan-300 text-sm">
                          {StorageService.formatINR(u.balance)}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">KYC Info</span>
                        <span className="font-mono text-white text-[10px] block truncate">
                          PAN: <strong className="text-amber-300 uppercase">{u.panNumber}</strong>
                        </span>
                        <span className="font-mono text-slate-400 text-[10px] block truncate">
                          UIDAI: {u.aadhaarNumber}
                        </span>
                      </div>
                    </div>

                    {/* Bank Account info */}
                    <div className="flex items-center justify-between text-[11px] px-1 text-slate-400">
                      <span className="truncate">
                        Bank: <strong className="text-slate-300">{u.bankDetails.bankName}</strong> (•• {u.bankDetails.accountNumber.slice(-4)})
                      </span>
                      <button
                        onClick={() => setViewingKycUser(u)}
                        className="text-cyan-400 hover:underline text-[10px] flex items-center gap-0.5 cursor-pointer shrink-0 ml-2"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Dossier</span>
                      </button>
                    </div>

                    {/* Direct Mobile Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Add Funds Button */}
                      <button
                        onClick={() => {
                          setSelectedUserForTopUp(u);
                          setTopUpAmount('50000');
                          setTopUpNote('Admin Unlimited Balance Top-Up');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <PlusCircle className="w-4 h-4" />
                        <span>+ Add Funds</span>
                      </button>

                      {/* Prominent Permanent Delete Account Button (এই মোবাইলে পার্মানেন্ট ডিলিট) */}
                      <button
                        onClick={() => setUserToDelete(u)}
                        className="py-2.5 px-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95 shadow-sm shadow-rose-950"
                        title="Delete user account permanently"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span>Delete Account</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Desktop Users Table (hidden on mobile, visible on md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">User & Contact</th>
                  <th className="py-3 px-4">Govt KYC (Aadhaar & PAN)</th>
                  <th className="py-3 px-4">Bank Account</th>
                  <th className="py-3 px-4">Wallet Balance</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No users match the search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isUserActive = u.isActive && !u.isDeleted;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/30 transition-colors">
                        {/* User & Contact */}
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.photoUrl}
                              alt={u.fullName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-700 shadow"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName)}&background=0284c7&color=fff`;
                              }}
                            />
                            <div>
                              <p className="font-bold text-white text-sm">{u.fullName}</p>
                              <p className="text-slate-400 font-mono">{u.email}</p>
                              <p className="text-[11px] text-cyan-400 font-mono">{u.phone}</p>
                            </div>
                          </div>
                        </td>

                        {/* KYC (Aadhaar & PAN) */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">UIDAI:</span>
                              <span className="font-mono text-white font-semibold">
                                {u.aadhaarNumber}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] text-slate-400 uppercase font-mono">PAN:</span>
                              <span className="font-mono text-amber-300 font-bold uppercase">
                                {u.panNumber}
                              </span>
                            </div>
                            <button
                              onClick={() => setViewingKycUser(u)}
                              className="text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5 underline cursor-pointer"
                            >
                              <Eye className="w-3 h-3" />
                              View Full Dossier
                            </button>
                          </div>
                        </td>

                        {/* Bank Details */}
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-slate-200">{u.bankDetails.bankName}</p>
                            <p className="text-[11px] text-slate-400 font-mono">
                              A/C: •••• {u.bankDetails.accountNumber.slice(-4)}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono">
                              IFSC: {u.bankDetails.ifscCode}
                            </p>
                            <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                              {u.bankDetails.accountType}
                            </span>
                          </div>
                        </td>

                        {/* Balance */}
                        <td className="py-4 px-4">
                          <p className="font-bold font-mono text-sm text-cyan-300">
                            {StorageService.formatINR(u.balance)}
                          </p>
                          <span className="text-[10px] text-slate-400 font-mono">INR Liquid</span>
                        </td>

                        {/* Active / Inactive Status (Rule: Admin can toggle) */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() => handleToggleUserStatus(u.id, isUserActive)}
                            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                              isUserActive
                                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                                : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                            }`}
                            title="Click to toggle user status (Active = Green, Inactive = Red)"
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${isUserActive ? 'bg-emerald-400' : 'bg-rose-500'}`}
                            />
                            <span>{isUserActive ? 'ACTIVE' : 'INACTIVE'}</span>
                          </button>
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* Rule: Admin can add unlimited funds */}
                            <button
                              onClick={() => {
                                setSelectedUserForTopUp(u);
                                setTopUpAmount('50000');
                                setTopUpNote('Admin Unlimited Balance Top-Up');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                              title="Add unlimited money to user wallet"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>+ Add Funds</span>
                            </button>

                            {/* Status toggle button */}
                            <button
                              onClick={() => handleToggleUserStatus(u.id, isUserActive)}
                              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                                isUserActive
                                  ? 'bg-slate-800 text-rose-400 hover:bg-rose-500/10 border-slate-700'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30'
                              }`}
                              title={isUserActive ? 'Deactivate User' : 'Activate User'}
                            >
                              <Power className="w-4 h-4" />
                            </button>

                            {/* Permanent Delete User button */}
                            <button
                              onClick={() => setUserToDelete(u)}
                              className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 transition-colors cursor-pointer"
                              title="Permanently Delete User Account"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: WITHDRAWAL REQUESTS DESK (Rule: Pending -> Admin Approve/Reject) */}
      {activeTab === 'withdrawals' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden glass-panel">
          {/* Header & Filter */}
          <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                Indian Banking Withdrawal Settlement Desk
              </h3>
              <p className="text-xs text-slate-400">
                Review pending settlement requests and issue UTR approvals or refunds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setWithdrawalFilter('pending')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  withdrawalFilter === 'pending'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Pending ({withdrawals.filter((w) => w.status === 'pending').length})
              </button>
              <button
                onClick={() => setWithdrawalFilter('approved')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  withdrawalFilter === 'approved'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Approved ({withdrawals.filter((w) => w.status === 'approved').length})
              </button>
              <button
                onClick={() => setWithdrawalFilter('rejected')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  withdrawalFilter === 'rejected'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Rejected ({withdrawals.filter((w) => w.status === 'rejected').length})
              </button>
              <button
                onClick={() => setWithdrawalFilter('all')}
                className={`px-3 py-1 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                  withdrawalFilter === 'all'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                All ({withdrawals.length})
              </button>
            </div>
          </div>

          <div className="divide-y divide-slate-800/60">
            {filteredWithdrawals.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <Clock className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No {withdrawalFilter !== 'all' ? withdrawalFilter : ''} withdrawal requests found</p>
              </div>
            ) : (
              filteredWithdrawals.map((req) => (
                <div key={req.id} className="p-5 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* User & Request info */}
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold font-mono text-white">
                          {StorageService.formatINR(req.amount)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            req.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : req.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {req.status}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          ID: {req.id.toUpperCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300">
                        Requested by: <strong className="text-white">{req.userName}</strong> ({req.userEmail} • {req.userPhone})
                      </div>

                      {/* Bank Details specified in prompt */}
                      <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Bank Name</span>
                          <span className="font-semibold text-white">{req.bankDetails.bankName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Account Holder</span>
                          <span className="font-semibold text-white">{req.bankDetails.accountHolderName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Account Number</span>
                          <span className="font-mono font-bold text-cyan-300">{req.bankDetails.accountNumber}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">IFSC & Account Type</span>
                          <span className="font-mono text-white">{req.bankDetails.ifscCode} • {req.bankDetails.accountType}</span>
                        </div>
                      </div>

                      {/* Timestamps & Remarks */}
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-2">
                        <span>Requested: {new Date(req.requestedAt).toLocaleString('en-IN')}</span>
                        {req.processedAt && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">Processed: {new Date(req.processedAt).toLocaleString('en-IN')}</span>
                          </>
                        )}
                        {req.utrNumber && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">UTR: {req.utrNumber}</span>
                          </>
                        )}
                      </div>

                      {req.adminRemark && (
                        <p className="text-xs text-amber-300 italic">
                          Remark: "{req.adminRemark}"
                        </p>
                      )}
                    </div>

                    {/* Action buttons (Only for pending requests) */}
                    {req.status === 'pending' ? (
                      <div className="flex items-center gap-2 self-start lg:self-center shrink-0">
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(req);
                            setActionType('approve');
                            setAdminRemark('Approved and settled via simulated IMPS protocol');
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Approve Payout
                        </button>
                        <button
                          onClick={() => {
                            setSelectedWithdrawal(req);
                            setActionType('reject');
                            setAdminRemark('Bank account verification failed. Funds refunded.');
                          }}
                          className="px-4 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject & Refund
                        </button>
                      </div>
                    ) : (
                      <div className="text-right text-xs text-slate-400 font-mono shrink-0">
                        Status Locked: {req.status.toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLATFORM MASTER LEDGER */}
      {activeTab === 'transactions' && (
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl overflow-hidden glass-panel">
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-white">Full Platform Financial Ledger</h3>
              <p className="text-xs text-slate-400">All credits, debits, admin top-ups, and user transfers across India</p>
            </div>
            <span className="text-xs font-mono text-cyan-400">{transactions.length} Records</span>
          </div>

          <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
            {transactions.map((tx) => {
              const isCredit = tx.type === 'credit' || tx.type === 'transfer_in' || tx.type === 'admin_grant';
              return (
                <div key={tx.id} className="p-4 hover:bg-slate-800/30 transition-colors flex items-center justify-between gap-4 text-xs">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCredit
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isCredit ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{tx.description}</p>
                      <p className="text-slate-400 font-mono">
                        User: <span className="text-slate-200">{tx.userName}</span> ({tx.userEmail}) • Ref: {tx.referenceId}
                      </p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className={`font-mono font-bold text-sm ${isCredit ? 'text-emerald-400' : 'text-slate-200'}`}>
                      {isCredit ? '+' : '-'}{StorageService.formatINR(tx.amount)}
                    </p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-mono text-slate-300">
                      {tx.type} • {tx.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST NOTIFICATION */}
      {activeTab === 'broadcast' && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl glass-panel space-y-5">
          <div className="text-center">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold font-heading text-white">
              Broadcast to Notification Bar
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Publish an immediate high-priority announcement to all active users on the platform.
            </p>
          </div>

          {broadcastSuccess && (
            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Broadcast dispatched successfully to Notification Bar & user inboxes!</span>
            </div>
          )}

          <form onSubmit={handleSendBroadcast} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Announcement Title
              </label>
              <input
                type="text"
                required
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                placeholder="e.g. Scheduled Maintenance or New Bonus Release"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Message Content
              </label>
              <textarea
                required
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="Enter the alert text to display on the top live ticker..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Alert Severity Level
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['info', 'success', 'warning', 'alert'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setBroadcastType(lvl)}
                    className={`py-2 rounded-xl text-xs font-semibold capitalize border transition-all cursor-pointer ${
                      broadcastType === lvl
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Broadcast Live to All Users</span>
            </button>
          </form>
        </div>
      )}

      {/* MODAL: ADMIN ADD UNLIMITED FUNDS (Rule: Admin can add unlimited funds to any user's wallet) */}
      {selectedUserForTopUp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel-glow">
            <button
              onClick={() => setSelectedUserForTopUp(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2">
                <PlusCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                Admin Unlimited Balance Credit
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target User: <strong className="text-white">{selectedUserForTopUp.fullName}</strong>
              </p>
            </div>

            {topUpSuccessMsg && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{topUpSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleExecuteTopUp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Current User Balance:</span>
                <span className="font-mono font-bold text-white">
                  {StorageService.formatINR(selectedUserForTopUp.balance)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Amount to Credit (₹ INR) - Unlimited
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-emerald-400 font-mono">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-lg font-mono font-bold text-white outline-none"
                  />
                </div>
              </div>

              {/* Quick Amount Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[10000, 50000, 100000, 500000, 1000000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    +₹{amt.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Credit Reason / Grant Remark
                </label>
                <input
                  type="text"
                  required
                  value={topUpNote}
                  onChange={(e) => setTopUpNote(e.target.value)}
                  placeholder="e.g. Special Privilege Grant, Compensation"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Execute Credit of {StorageService.formatINR(parseFloat(topUpAmount) || 0)}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAWAL APPROVE / REJECT */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel">
            <button
              onClick={() => setSelectedWithdrawal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="text-center mb-5">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-2 ${
                  actionType === 'approve'
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                }`}
              >
                {actionType === 'approve' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
              </div>
              <h3 className="text-xl font-bold font-heading text-white">
                {actionType === 'approve' ? 'Approve Settlement Payout' : 'Reject Withdrawal Request'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {actionType === 'approve'
                  ? 'Confirm simulated IMPS dispatch and assign UTR number'
                  : 'Rejecting will automatically restore the held amount to user wallet'}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">User:</span>
                <span className="font-semibold text-white">{selectedWithdrawal.userName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Withdrawal Amount:</span>
                <span className="font-mono font-bold text-amber-300">
                  {StorageService.formatINR(selectedWithdrawal.amount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bank Name:</span>
                <span className="font-medium text-slate-200">{selectedWithdrawal.bankDetails.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Account No & IFSC:</span>
                <span className="font-mono text-cyan-300">
                  {selectedWithdrawal.bankDetails.accountNumber} • {selectedWithdrawal.bankDetails.ifscCode}
                </span>
              </div>
            </div>

            <form onSubmit={handleProcessWithdrawal} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  {actionType === 'approve' ? 'Approval Remark / Note' : 'Rejection Reason *'}
                </label>
                <textarea
                  required={actionType === 'reject'}
                  rows={2}
                  value={adminRemark}
                  onChange={(e) => setAdminRemark(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'Approved and settled via simulated IMPS'
                      : 'Please specify reason (e.g. Invalid IFSC Code or KYC Mismatch)'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 text-xs text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  actionType === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                    : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                }`}
              >
                {actionType === 'approve' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm Approval & Issue UTR</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    <span>Confirm Rejection & Refund Funds</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* USER KYC DOSSIER MODAL */}
      {viewingKycUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel">
            <button
              onClick={() => setViewingKycUser(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 border-b border-slate-800 pb-4 mb-4">
              <img
                src={viewingKycUser.photoUrl}
                alt={viewingKycUser.fullName}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-400 shadow-lg"
              />
              <div>
                <h3 className="font-bold text-lg text-white">{viewingKycUser.fullName}</h3>
                <p className="text-xs text-slate-400 font-mono">{viewingKycUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono border border-cyan-500/30">
                    KYC VERIFIED
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                      viewingKycUser.isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {viewingKycUser.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Phone Number:</span>
                <span className="font-mono font-bold text-white">{viewingKycUser.phone}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">Aadhaar (UIDAI 12-Digits):</span>
                <span className="font-mono font-bold text-cyan-300">{viewingKycUser.aadhaarNumber}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 flex justify-between items-center">
                <span className="text-slate-400">PAN (Income Tax Dept):</span>
                <span className="font-mono font-bold text-amber-300 uppercase">{viewingKycUser.panNumber}</span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
                <span className="text-slate-400 block font-semibold text-[11px] mb-1">Registered Bank Details:</span>
                <div className="grid grid-cols-2 gap-2 text-slate-200">
                  <p>Bank: <strong className="text-white">{viewingKycUser.bankDetails.bankName}</strong></p>
                  <p>A/C: <strong className="text-white font-mono">{viewingKycUser.bankDetails.accountNumber}</strong></p>
                  <p>IFSC: <strong className="text-white font-mono">{viewingKycUser.bankDetails.ifscCode}</strong></p>
                  <p>Type: <strong className="text-emerald-400">{viewingKycUser.bankDetails.accountType}</strong></p>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  const target = viewingKycUser;
                  setViewingKycUser(null);
                  setUserToDelete(target);
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Delete Account Permanently</span>
              </button>

              <button
                onClick={() => setViewingKycUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PERMANENT DELETE USER CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-[#0a0f18] border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Permanent Account Delete</h3>
                <p className="text-xs text-rose-400">This action cannot be undone.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300 font-medium">
                এই ইউজারের একাউন্ট, ওয়ালেট ব্যালেন্স এবং সমস্ত ডাটা এই ডিভাইস থেকে স্থায়ীভাবে ডিলিট করতে চান?
              </p>
              <p className="text-slate-400 text-[11px]">
                Are you sure you want to permanently delete this user account from this mobile device?
              </p>
              <div className="pt-2 border-t border-slate-800 text-slate-400 space-y-0.5">
                <p><strong className="text-white text-sm">{userToDelete.fullName}</strong></p>
                <p className="font-mono text-[11px] text-cyan-300">{userToDelete.email}</p>
                <p className="font-mono text-[11px] text-slate-400">UIDAI: {userToDelete.aadhaarNumber}</p>
                <p className="font-mono text-emerald-400 font-bold mt-1 text-sm">Wallet Balance: ₹{userToDelete.balance.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="w-1/2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecutePermanentDelete}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer transition-all"
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
