import React, { useState } from 'react';
import { X, QrCode, Smartphone, Building, CheckCircle2, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface AddMoneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSuccess: () => void;
}

export const AddMoneyModal: React.FC<AddMoneyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSuccess,
}) => {
  const [amount, setAmount] = useState<string>('5000');
  const [method, setMethod] = useState<'upi' | 'qr' | 'netbanking'>('upi');
  const [upiId, setUpiId] = useState(`${currentUser.email.split('@')[0]}@okaxis`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickAmounts = [500, 1000, 2000, 5000, 10000, 50000, 100000];

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      return setError('Please enter a valid deposit amount greater than ₹0');
    }

    setIsProcessing(true);

    setTimeout(() => {
      const methodName = method === 'upi' ? `UPI (${upiId})` : method === 'qr' ? 'Simulated QR Scan' : 'Netbanking';
      const res = StorageService.userAddFunds(currentUser.id, num, methodName);

      setIsProcessing(false);

      if (!res.success) {
        setError(res.error || 'Failed to add funds');
        return;
      }

      // Celebrate with confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch {
        // ignore
      }

      onSuccess();
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl glass-panel-glow">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold font-heading text-white">Add Funds to Metal Wallet</h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulated Indian UPI / Netbanking Gateway (Zero Fees)
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleDeposit} className="space-y-4">
          {/* Amount Input */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Enter Amount (₹ INR)
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
                placeholder="5000"
                className="w-full pl-9 pr-4 py-3 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-cyan-500 text-lg font-mono font-bold text-white outline-none"
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
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                +₹{q.toLocaleString('en-IN')}
              </button>
            ))}
          </div>

          {/* Method Selection */}
          <div className="pt-2">
            <label className="block text-xs font-medium text-slate-300 mb-2">
              Choose Simulated Deposit Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('upi')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  method === 'upi'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-4 h-4 text-cyan-400" />
                <span className="text-[11px] font-semibold">UPI Apps</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('qr')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  method === 'qr'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <QrCode className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-semibold">QR Code</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('netbanking')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                  method === 'netbanking'
                    ? 'bg-cyan-500/15 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Building className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-semibold">Netbanking</span>
              </button>
            </div>
          </div>

          {/* Method Details */}
          {method === 'upi' && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                Virtual UPI ID (Simulated)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-cyan-300 outline-none"
              />
            </div>
          )}

          {method === 'qr' && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center gap-3">
              <div className="w-14 h-14 bg-white p-1 rounded-lg flex items-center justify-center shrink-0">
                <QrCode className="w-12 h-12 text-slate-900" />
              </div>
              <div className="text-[11px] text-slate-300">
                <p className="font-semibold text-white">Metal Bharat-QR Simulator</p>
                <p className="text-slate-400">Scan to simulate immediate credit into your ₹ INR balance.</p>
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-300">
              <span className="text-emerald-400 font-semibold">Direct simulated IMPS/NEFT</span> bank integration with zero settlement delay.
            </div>
          )}

          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2 text-[11px] text-emerald-300">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Simulated test transaction. No real credit card or bank funds required.</span>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? (
              <span>Simulating Network Confirmation...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Add {StorageService.formatINR(parseFloat(amount) || 0)} Instantly</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
