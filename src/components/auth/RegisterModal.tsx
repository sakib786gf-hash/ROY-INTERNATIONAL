import React, { useState } from 'react';
import {
  X,
  User as UserIcon,
  Phone,
  CreditCard,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Mail,
  ArrowRight
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { User } from '../../types';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  onSwitchToLogin: () => void;
}

export const RegisterModal: React.FC<RegisterModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onSwitchToLogin,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
  );

  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Formatting Aadhaar: 12 digits (XXXX XXXX XXXX)
  const handleAadhaarChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 12);
    const parts = raw.match(/.{1,4}/g);
    setAadhaarNumber(parts ? parts.join(' ') : raw);
  };

  // Formatting PAN: 10 chars uppercase alphanumeric
  const handlePanChange = (val: string) => {
    const raw = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setPanNumber(raw);
  };

  // Image Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Pre-fill sample avatars
  const avatarPresets = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) return setError('Please enter your Full Name');
    if (!phone.trim()) return setError('Please enter your Phone Number');
    if (!password || password.length < 4) return setError('Password must be at least 4 characters');
    if (confirmPassword && password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (aadhaarNumber.replace(/\s/g, '').length !== 12) {
      return setError('Aadhaar Number must be exactly 12 digits');
    }
    if (panNumber.length !== 10) {
      return setError('PAN Number must be 10 characters (e.g., ABCDE1234F)');
    }

    const cleanEmail = email.trim().toLowerCase() || `${fullName.toLowerCase().replace(/\s+/g, '')}@metal.in`;

    const result = StorageService.registerUser({
      fullName: fullName.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      password: password.trim(),
      aadhaarNumber: aadhaarNumber.trim(),
      panNumber: panNumber.trim(),
      photoUrl,
    });

    if (!result.success) {
      setError(result.error || 'Registration failed');
      return;
    }

    if (result.user) {
      StorageService.setCurrentUserId(result.user.id);
      onSuccess(result.user);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl glass-panel my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold font-heading text-white">Create Metal Wallet</h2>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-4 p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="relative group shrink-0">
              <img
                src={photoUrl}
                alt="Profile Preview"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-400/50 shadow-lg"
              />
              <label className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-opacity text-[10px] text-emerald-300 font-medium">
                <Upload className="w-4 h-4 mb-0.5" />
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-semibold text-white">Profile Photo</p>
              <p className="text-[11px] text-slate-400 mb-2">
                Choose an avatar or upload custom photo
              </p>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                {avatarPresets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPhotoUrl(preset)}
                    className={`w-7 h-7 rounded-lg overflow-hidden border transition-all cursor-pointer ${
                      photoUrl === preset ? 'border-emerald-400 scale-110' : 'border-slate-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
                <label className="text-[11px] px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 cursor-pointer transition-colors">
                  Upload
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Full Name (As per Govt ID) *
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sakib Khan"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sakib786gf@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono"
                />
              </div>
            </div>

            {/* Aadhaar Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>Aadhaar Number (12 Digits) *</span>
                <span className="text-[10px] text-cyan-400 font-mono">
                  {aadhaarNumber.replace(/\s/g, '').length}/12
                </span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={aadhaarNumber}
                  onChange={(e) => handleAadhaarChange(e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono tracking-wider"
                />
              </div>
            </div>

            {/* PAN Number */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                <span>PAN Number *</span>
                <span className="text-[10px] text-amber-400 font-mono">
                  {panNumber.length}/10
                </span>
              </label>
              <div className="relative">
                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={panNumber}
                  onChange={(e) => handlePanChange(e.target.value)}
                  placeholder="ABCDE1234F"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700 focus:border-emerald-500 text-xs text-white placeholder-slate-500 outline-none font-mono uppercase tracking-wider"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-4 py-3.5 px-4 rounded-xl bg-[#65ff00] hover:bg-[#57de00] text-black font-extrabold text-sm shadow-lg shadow-[#65ff00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Create Wallet</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </form>

        <div className="mt-5 text-center pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400">
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => {
                onClose();
                onSwitchToLogin();
              }}
              className="text-[#65ff00] hover:underline font-semibold cursor-pointer ml-1"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
