import React, { useState } from 'react';
import { X, Send, UserCheck, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface SendMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  allUsers: User[];
  onSuccess: () => void;
}

export const SendMoneyModal: React.FC<SendMoneyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  allUsers,
  onSuccess,
}) => {
  const [recipientQuery, setRecipientQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('Payment via Metal Wallet');
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  // Filter other users
  const eligibleRecipients = allUsers.filter((u) => u.id !== currentUser.id && u.role === 'user');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return setError('Please enter a valid amount greater than ₹0');
    }

    if (num > currentUser.balance) {
      return setError(`Insufficient balance. Available: ${StorageService.formatINR(currentUser.balance)}`);
    }

    if (!recipientQuery.trim()) {
      return setError('Please specify recipient Email, Phone, or Name');
    }

    setIsSending(true);

    setTimeout(() => {
      const res = StorageService.transferFunds(currentUser.id, recipientQuery, num, note);
      setIsSending(false);

      if (!res.success) {
        setError(res.error || 'Transfer failed');
        return;
      }

      onSuccess();
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl glass-panel-glow">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-2">
            <Send className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-white">Send Money Instantly</h2>
          <p className="text-xs text-slate-400">
            Transfer to any registered Metal Wallet user in ₹ INR
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSend} className="space-y-4">
          {/* Recipient Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Recipient Email, Phone, or Name
            </label>
            <input
              type="text"
              required
              value={recipientQuery}
              onChange={(e) => setRecipientQuery(e.target.value)}
              placeholder="e.g. sakib786gf@gmail.com or 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-sm text-white placeholder-slate-500 outline-none"
            />
          </div>

          {/* Quick User Chips */}
          {eligibleRecipients.length > 0 && (
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-mono mb-1.5">Quick Recipients:</p>
              <div className="flex flex-wrap gap-1.5">
                {eligibleRecipients.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => setRecipientQuery(u.email)}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    <span>{u.fullName.split(' ')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({u.email.split('@')[0]})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Amount (₹ INR)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-cyan-400 font-mono">
                ₹
              </span>
              <input
                type="number"
                min="1"
                step="any"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="1000"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-lg font-mono font-bold text-white outline-none"
              />
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Transfer Note / Remarks
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Lunch split, Project payment"
              className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-xs text-white placeholder-slate-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSending ? (
              <span>Executing Transfer...</span>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Send {StorageService.formatINR(parseFloat(amount) || 0)} Now</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
