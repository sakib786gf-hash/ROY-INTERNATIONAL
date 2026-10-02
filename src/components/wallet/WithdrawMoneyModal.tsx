import React, { useState } from 'react';
import {
  X,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User, BankDetails } from '../../types';

interface WithdrawMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: () => void;
}

export const WithdrawMoneyModal: React.FC<WithdrawMoneyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('5000');
  const [isEditingBank, setIsEditingBank] = useState(!currentUser.bankDetails?.accountNumber);

  // Bank details state pre-filled from user's profile
  const [bankDetails, setBankDetails] = useState<BankDetails>({
    bankName: currentUser.bankDetails?.bankName || 'State Bank of India',
    accountHolderName: currentUser.bankDetails?.accountHolderName || currentUser.fullName,
    accountNumber: currentUser.bankDetails?.accountNumber || '',
    ifscCode: currentUser.bankDetails?.ifscCode || 'SBIN0001234',
    accountType: currentUser.bankDetails?.accountType || 'Savings Account',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [1000, 2000, 5000, 10000, 25000];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentUser.isActive) {
      return setError('ID Inactive');
    }

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return setError('Please enter a valid withdrawal amount greater than ₹0');
    }

    if (num > currentUser.balance) {
      return setError(`Insufficient balance. Maximum available: ${StorageService.formatINR(currentUser.balance)}`);
    }

    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      setIsEditingBank(true);
      return setError('Bank Account Number and IFSC Code are required for withdrawal.');
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Always persist bank details on withdrawal
      StorageService.updateUser(currentUser.id, { bankDetails });

      const res = StorageService.createWithdrawalRequest(currentUser.id, num, bankDetails);
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || 'Failed to process bank withdrawal');
        return;
      }

      onSuccess();
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel-glow my-6">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-2">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-white">Withdraw to Bank Account</h2>
          <p className="text-xs text-slate-400">
            Transfer funds directly to your linked Savings Account
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!currentUser.isActive ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white font-heading">ID Inactive</h3>
              <p className="text-xs text-slate-300 mt-2 max-w-xs mx-auto">
                Withdrawals cannot be processed because this account ID is currently inactive.
              </p>
            </div>
            <div className="pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          {/* Balance Preview */}
          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400">Available Wallet Balance:</span>
            <span className="text-sm font-bold font-mono text-cyan-300">
              {StorageService.formatINR(currentUser.balance)}
            </span>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Withdrawal Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-amber-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                min="100"
                max={currentUser.balance}
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-amber-500 text-lg font-mono font-bold text-white outline-none"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex flex-wrap gap-1.5">
            {quickAmounts.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                  amount === q.toString()
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                ₹{q.toLocaleString('en-IN')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmount(currentUser.balance.toString())}
              className="px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 cursor-pointer"
            >
              Withdraw All
            </button>
          </div>

          {/* Bank Details section required in prompt */}
          <div className="p-4 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                {currentUser.bankDetails?.accountNumber ? 'Linked Bank Details' : 'Enter Bank Details for Withdrawal'}
              </span>
              {currentUser.bankDetails?.accountNumber && (
                <button
                  type="button"
                  onClick={() => setIsEditingBank(!isEditingBank)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 font-medium cursor-pointer"
                >
                  {isEditingBank ? 'Done Editing' : 'Edit Bank Info'}
                </button>
              )}
            </div>

            {isEditingBank ? (
              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">Bank Name</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails({ ...bankDetails, bankName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Account Holder Name</label>
                  <input
                    type="text"
                    required
                    value={bankDetails.accountHolderName}
                    onChange={(e) => setBankDetails({ ...bankDetails, accountHolderName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-slate-400 block mb-1">Account Number</label>
                    <input
                      type="text"
                      required
                      value={bankDetails.accountNumber}
                      onChange={(e) => setBankDetails({ ...bankDetails, accountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-slate-400 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      required
                      value={bankDetails.ifscCode}
                      onChange={(e) => setBankDetails({ ...bankDetails, ifscCode: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono uppercase outline-none"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-slate-500 text-[10px]">Bank Name</p>
                  <p className="font-semibold text-slate-200">{bankDetails.bankName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Account Holder</p>
                  <p className="font-semibold text-slate-200 truncate">{bankDetails.accountHolderName}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">Account Number</p>
                  <p className="font-mono text-slate-200">
                    {bankDetails.accountNumber ? `•••• ${bankDetails.accountNumber.slice(-4)}` : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 text-[10px]">IFSC Code</p>
                  <p className="font-mono text-cyan-300 font-semibold">{bankDetails.ifscCode}</p>
                </div>
                <div className="col-span-2 pt-1 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-slate-500 text-[10px]">Account Type:</span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium text-[11px]">
                    {bankDetails.accountType}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || currentUser.balance <= 0}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Submitting Request...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Withdrawal Request ({StorageService.formatINR(parseFloat(amount) || 0)})</span>
              </>
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};
