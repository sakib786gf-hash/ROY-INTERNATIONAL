export type UserRole = 'admin' | 'user';

export type AccountType = 'Savings Account' | 'Current Account';

export interface BankDetails {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  accountType: AccountType;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  aadhaarNumber: string; // 12 digits
  panNumber: string; // 10 chars format ABCDE1234F
  photoUrl: string;
  role: UserRole;
  balance: number; // in ₹ INR
  isActive: boolean; // Admin can toggle, or set to inactive on delete
  isDeleted: boolean; // Flag when user deleted/deactivated their account
  bankDetails: BankDetails;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType =
  | 'credit'
  | 'debit'
  | 'transfer_in'
  | 'transfer_out'
  | 'withdrawal'
  | 'admin_grant';

export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'refunded';

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: TransactionType;
  amount: number;
  description: string;
  referenceId: string;
  status: TransactionStatus;
  createdAt: string;
  senderOrRecipient?: string;
  adminRemark?: string;
}

export type WithdrawalStatus = 'pending' | 'approved' | 'rejected';

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  amount: number;
  bankDetails: BankDetails;
  status: WithdrawalStatus;
  adminRemark?: string;
  utrNumber?: string;
  requestedAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface NotificationItem {
  id: string;
  userId: string; // 'all' or specific user id
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalSystemBalance: number;
  totalWithdrawalsProcessed: number;
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  totalTransactionsCount: number;
}
