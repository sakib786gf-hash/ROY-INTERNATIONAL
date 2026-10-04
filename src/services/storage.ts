import {
  User,
  Transaction,
  WithdrawalRequest,
  NotificationItem,
  PlatformStats
} from '../types';
import { CloudSync } from './cloudSync';

const STORAGE_KEYS = {
  USERS: 'metal_wallet_users_v4',
  CURRENT_USER_ID: 'metal_wallet_current_user_id_v4',
  TRANSACTIONS: 'metal_wallet_transactions_v4',
  WITHDRAWALS: 'metal_wallet_withdrawals_v4',
  NOTIFICATIONS: 'metal_wallet_notifications_v4',
};

// Default Admin specified in prompt:
// Username/Email: izaz786@metal.com
// Password: Izaz@123
// Admin has NO wallet balance or personal wallet
export const DEFAULT_ADMIN: User = {
  id: 'admin-izaz-001',
  fullName: 'Izaz Metal Admin',
  email: 'izaz786@metal.com',
  phone: '+91 98321 00786',
  aadhaarNumber: '9988 7766 5544',
  panNumber: 'IZAZA7860M',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  role: 'admin',
  balance: 0, // Admin has NO personal wallet
  isActive: true,
  isDeleted: false,
  bankDetails: {
    bankName: 'System Banking Gateway',
    accountHolderName: 'Platform Reserve Desk',
    accountNumber: 'RBI-NET-0001',
    ifscCode: 'RBIS0000001',
    accountType: 'Current Account',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

// Sample standard users
const INITIAL_USERS: User[] = [
  DEFAULT_ADMIN,
  {
    id: 'user-sakib-002',
    fullName: 'Sakib Khan',
    email: 'sakib786gf@gmail.com',
    phone: '+91 98765 43210',
    password: 'Sakib@123',
    aadhaarNumber: '7821 4590 1234',
    panNumber: 'ABCDE1234F',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-01-10T11:20:00.000Z',
    updatedAt: '2026-01-10T11:20:00.000Z',
  },
  {
    id: 'user-ss-8910642',
    fullName: 'Sakib (SS Metal User)',
    email: 'ss8910642@gmail.com',
    phone: '+91 89106 42786',
    password: 'User@123',
    aadhaarNumber: '8910 6420 5647',
    panNumber: 'SSPAN5647M',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-02-01T10:00:00.000Z',
    updatedAt: '2026-02-01T10:00:00.000Z',
  },
  {
    id: 'user-priya-003',
    fullName: 'Priya Sharma',
    email: 'priya.s@metal.in',
    phone: '+91 91234 56789',
    password: 'Priya@123',
    aadhaarNumber: '9832 1045 8821',
    panNumber: 'BKZPS4920K',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-01-15T09:45:00.000Z',
    updatedAt: '2026-01-15T09:45:00.000Z',
  },
  {
    id: 'user-rahul-004',
    fullName: 'Rahul Varma',
    email: 'rahul.v@metal.in',
    phone: '+91 94567 89012',
    password: 'Rahul@123',
    aadhaarNumber: '4455 6677 8899',
    panNumber: 'APZRV9012M',
    photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-02-01T14:30:00.000Z',
    updatedAt: '2026-02-01T14:30:00.000Z',
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [];

const INITIAL_WITHDRAWALS: WithdrawalRequest[] = [
  {
    id: 'wdr-201',
    userId: 'user-sakib-002',
    userName: 'Sakib Khan',
    userEmail: 'sakib786gf@gmail.com',
    userPhone: '+91 98765 43210',
    amount: 15000,
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolderName: 'Sakib Khan',
      accountNumber: '38947281920',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings Account',
    },
    status: 'approved',
    utrNumber: 'UTR-MET-20260228-0814',
    requestedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    processedAt: new Date(Date.now() - 3600000 * 3.8).toISOString(),
  },
  {
    id: 'wdr-202',
    userId: 'user-priya-003',
    userName: 'Priya Sharma',
    userEmail: 'priya.s@metal.in',
    userPhone: '+91 91234 56789',
    amount: 8000,
    bankDetails: {
      bankName: 'ICICI Bank',
      accountHolderName: 'Priya Sharma',
      accountNumber: '001101567890',
      ifscCode: 'ICIC0000011',
      accountType: 'Savings Account',
    },
    status: 'approved',
    utrNumber: 'UTR-MET-20260228-0912',
    adminRemark: 'Verified and processed via IMPS Settlement',
    requestedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    processedBy: 'izaz786@metal.com',
  },
  {
    id: 'wdr-203',
    userId: 'user-rahul-004',
    userName: 'Rahul Varma',
    userEmail: 'rahul.v@metal.in',
    userPhone: '+91 94567 89012',
    amount: 25000,
    bankDetails: {
      bankName: 'Punjab National Bank',
      accountHolderName: 'Rahul Varma',
      accountNumber: '0624000100987654',
      ifscCode: 'PUNB0062400',
      accountType: 'Savings Account',
    },
    status: 'rejected',
    adminRemark: 'Account was marked inactive. Funds restored.',
    requestedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    processedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    processedBy: 'izaz786@metal.com',
  }
];

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-2',
    userId: 'user-sakib-002',
    title: 'Bank Withdrawal Successful',
    message: 'Your withdrawal of ₹15,000 to SBI Savings Account was settled successfully.',
    type: 'info',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'admin-izaz-001',
    title: 'Settlement Notification',
    message: 'Settlement desk status verified.',
    type: 'alert',
    isRead: false,
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  }
];

// Helper to broadcast custom storage events
const dispatchStorageEvent = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('metal_wallet_data_changed'));
  }
};

export const StorageService = {
  // --- USERS ---
  getUsers(): User[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      let parsed: User[] = [];
      if (!data) {
        // Check prior storage versions to preserve any users created by admin
        const oldV2 = localStorage.getItem('metal_wallet_users_v2');
        const oldV1 = localStorage.getItem('metal_wallet_users');
        if (oldV2) {
          try { parsed = JSON.parse(oldV2); } catch { parsed = [...INITIAL_USERS]; }
        } else if (oldV1) {
          try { parsed = JSON.parse(oldV1); } catch { parsed = [...INITIAL_USERS]; }
        } else {
          parsed = [...INITIAL_USERS];
        }
      } else {
        parsed = JSON.parse(data);
      }

      // Ensure every user in INITIAL_USERS (admin, sakib, etc.) is present with clean fresh defaults
      for (const initUser of INITIAL_USERS) {
        const foundIdx = parsed.findIndex((u) => u.email.toLowerCase() === initUser.email.toLowerCase());
        if (foundIdx === -1) {
          parsed.push(initUser);
        } else {
          // Keep saved user modifications while ensuring vital fields are preserved
          let userBal = parsed[foundIdx].balance !== undefined ? parsed[foundIdx].balance : initUser.balance;
          // Rule: If balance was stuck at the legacy fake 75500 or 75000 from old test runs, reset to 0
          if (userBal === 75500 || userBal === 75000) {
            userBal = 0;
          }
          parsed[foundIdx] = {
            ...initUser,
            ...parsed[foundIdx],
            password: parsed[foundIdx].password || initUser.password,
            phone: parsed[foundIdx].phone || initUser.phone,
            aadhaarNumber: parsed[foundIdx].aadhaarNumber || initUser.aadhaarNumber,
            panNumber: parsed[foundIdx].panNumber || initUser.panNumber,
            balance: userBal,
          };
        }
      }

      // Also reset any other user's balance if stuck at 75500
      parsed = parsed.map(u => {
        if (u.balance === 75500 || u.balance === 75000) {
          return { ...u, balance: 0 };
        }
        return u;
      });

      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));

      // Admin has NO account balance; reset auto-generated fake bank details to blank
      return parsed.map((u) => {
        let userObj = u.role === 'admin' ? { ...u, balance: 0 } : u;
        if (
          userObj.bankDetails?.accountNumber === '94567001419' ||
          userObj.bankDetails?.accountNumber === '38947281920' ||
          userObj.bankDetails?.accountNumber === '001101567890' ||
          userObj.bankDetails?.accountNumber === '0624000100987654' ||
          userObj.email?.toLowerCase().includes('iran') ||
          userObj.fullName?.toLowerCase().includes('iran')
        ) {
          userObj = {
            ...userObj,
            bankDetails: {
              bankName: '',
              accountHolderName: '',
              accountNumber: '',
              ifscCode: '',
              accountType: 'Savings Account',
            },
          };
        }
        return userObj;
      });
    } catch {
      return INITIAL_USERS;
    }
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    dispatchStorageEvent();
    CloudSync.pushAllToServer({
      users,
      transactions: this.getTransactions(),
      withdrawals: this.getWithdrawals(),
      notifications: this.getNotifications(),
    }).catch(() => {});
  },

  // Pull latest users and sync across all devices and browsers
  async syncWithServer(): Promise<boolean> {
    try {
      const res = await CloudSync.syncFromServer();
      if (res.success) {
        let changed = false;

        // Sync Users
        if (Array.isArray(res.users) && res.users.length > 0) {
          const local = this.getUsers();
          for (const sUser of res.users) {
            const idx = local.findIndex((u) => u.id === sUser.id || u.email.toLowerCase() === sUser.email.toLowerCase());
            if (idx === -1) {
              local.push(sUser);
              changed = true;
            } else {
              local[idx] = { ...local[idx], ...sUser };
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(local));
          }
        }

        // Sync Transactions
        if (Array.isArray(res.transactions) && res.transactions.length > 0) {
          const localTxs = this.getTransactions();
          for (const sTx of res.transactions) {
            if (!localTxs.some((t) => t.id === sTx.id)) {
              localTxs.unshift(sTx);
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(localTxs));
          }
        }

        // Sync Withdrawals
        if (Array.isArray(res.withdrawals) && res.withdrawals.length > 0) {
          const localWdrs = this.getWithdrawals();
          for (const sWdr of res.withdrawals) {
            const wIdx = localWdrs.findIndex((w) => w.id === sWdr.id);
            if (wIdx === -1) {
              localWdrs.unshift(sWdr);
              changed = true;
            } else {
              localWdrs[wIdx] = sWdr;
              changed = true;
            }
          }
          if (changed) {
            localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(localWdrs));
          }
        }

        if (changed) {
          dispatchStorageEvent();
        }
        return true;
      }
    } catch {
      // offline / standalone mode
    }
    return false;
  },

  getUserById(id: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  },

  getUserByEmail(email: string): User | undefined {
    const users = this.getUsers();
    return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  },

  getCurrentUserId(): string {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    return saved || '';
  },

  setCurrentUserId(id: string) {
    if (!id) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, id);
    }
    dispatchStorageEvent();
  },

  getCurrentUser(): User | undefined {
    const id = this.getCurrentUserId();
    if (!id) return undefined;
    return this.getUserById(id);
  },

  registerUser(
    userData: Omit<User, 'id' | 'role' | 'balance' | 'isActive' | 'isDeleted' | 'createdAt' | 'updatedAt' | 'bankDetails'> & {
      bankDetails?: User['bankDetails'];
      initialBalance?: number;
    }
  ): { success: boolean; user?: User; error?: string } {
    const users = this.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());
    if (existing) {
      return { success: false, error: 'An account with this email address already exists.' };
    }

    const startBalance = Number(userData.initialBalance) || 0;

    const newUser: User = {
      bankDetails: userData.bankDetails || {
        bankName: '',
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        accountType: 'Savings Account',
      },
      ...userData,
      id: `user-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      role: 'user',
      balance: startBalance,
      isActive: true,
      isDeleted: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    CloudSync.saveUserToServer(newUser).catch(() => {});

    // If Admin assigned initial balance, record transaction specifically for this new user
    if (startBalance > 0) {
      this.addTransaction({
        userId: newUser.id,
        userName: newUser.fullName,
        userEmail: newUser.email,
        type: 'credit',
        amount: startBalance,
        description: 'Account Credited',
        referenceId: `CR-MET-${Date.now().toString().slice(-5)}`,
        status: 'completed',
      });
    }

    // Notify admin
    this.addNotification({
      userId: DEFAULT_ADMIN.id,
      title: 'New User Registered',
      message: `${newUser.fullName} (${newUser.email}) just created an account with Aadhaar & PAN verification.`,
      type: 'info',
    });

    return { success: true, user: newUser };
  },

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return undefined;

    users[index] = {
      ...users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.saveUsers(users);
    return users[index];
  },

  // Toggle user active / inactive by Admin (No notification sent to user as requested)
  toggleUserStatus(userId: string, isActive: boolean): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    this.updateUser(userId, { isActive });
    return true;
  },

  // Rule 10: "প্রত্যেক ইউজার এখন ডিলিট করার পরে একাউন্ট ইনঅ্যাক্টিভ থাকবে। যতক্ষণ না ইউজার অ্যাক্টিভ করবে"
  // When user requests deletion, account becomes Inactive
  deleteOrDeactivateUserAccount(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    this.updateUser(userId, {
      isActive: false,
      isDeleted: true,
    });

    return true;
  },

  // Permanent account deletion by Admin from device
  deleteUserPermanently(userId: string): { success: boolean; error?: string } {
    const users = this.getUsers();
    const targetUser = users.find((u) => u.id === userId);
    if (!targetUser) return { success: false, error: 'User not found' };
    if (targetUser.role === 'admin') return { success: false, error: 'Cannot delete admin account' };

    const remainingUsers = users.filter((u) => u.id !== userId);
    this.saveUsers(remainingUsers);

    // Remove user transactions
    const txs = this.getTransactions().filter((t) => t.userId !== userId);
    this.saveTransactions(txs);

    // Remove user withdrawals
    const wdrs = this.getWithdrawals().filter((w) => w.userId !== userId);
    this.saveWithdrawals(wdrs);

    // Remove user notifications
    const notifs = this.getNotifications().filter((n) => n.userId !== userId);
    this.saveNotifications(notifs);

    // If active user is this user, clear active session
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === userId) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER_ID);
    }

    return { success: true };
  },

  // Reactivate user account
  reactivateUserAccount(userId: string): boolean {
    const user = this.getUserById(userId);
    if (!user) return false;

    this.updateUser(userId, {
      isActive: true,
      isDeleted: false,
    });

    return true;
  },

  // Rule: Admin can add unlimited funds to any user's account
  adminAddFunds(userId: string, amount: number, note: string = 'Account Credited'): { success: boolean; newBalance?: number; error?: string } {
    if (amount <= 0) return { success: false, error: 'Amount must be greater than ₹0' };
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    const newBalance = user.balance + amount;
    this.updateUser(userId, { balance: newBalance });

    // Record transaction as Account Credited
    this.addTransaction({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      type: 'credit',
      amount,
      description: note && !note.toLowerCase().includes('admin') && !note.toLowerCase().includes('wallet') ? note : 'Account Credited',
      referenceId: `DEP-${Date.now().toString().slice(-6)}`,
      status: 'completed',
    });

    // Notify user
    this.addNotification({
      userId: user.id,
      title: 'Account Credited 💰',
      message: `Your Metal Account has been credited with ${this.formatINR(amount)}.`,
      type: 'success',
    });

    return { success: true, newBalance };
  },

  // Simulated Deposit / Add Money by User
  userAddFunds(userId: string, amount: number, paymentMethod: string): { success: boolean; newBalance?: number; error?: string } {
    if (amount <= 0) return { success: false, error: 'Amount must be positive' };
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (!user.isActive) return { success: false, error: 'Account is inactive. Please reactivate first.' };

    const newBalance = user.balance + amount;
    this.updateUser(userId, { balance: newBalance });

    this.addTransaction({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      type: 'credit',
      amount,
      description: `Simulated Deposit via ${paymentMethod}`,
      referenceId: `DEP-${Date.now().toString().slice(-8)}`,
      status: 'completed',
    });

    this.addNotification({
      userId: user.id,
      title: 'Funds Added Successfully 💳',
      message: `${this.formatINR(amount)} added to your account via ${paymentMethod}.`,
      type: 'success',
    });

    return { success: true, newBalance };
  },

  // Transfer funds between users
  transferFunds(senderId: string, recipientQuery: string, amount: number, note: string): { success: boolean; error?: string } {
    if (amount <= 0) return { success: false, error: 'Amount must be positive' };
    const sender = this.getUserById(senderId);
    if (!sender) return { success: false, error: 'Sender not found' };
    if (!sender.isActive) return { success: false, error: 'Your account is inactive.' };
    if (sender.balance < amount) return { success: false, error: 'Insufficient account balance.' };

    const users = this.getUsers();
    const query = recipientQuery.trim().toLowerCase();
    const recipient = users.find(
      (u) =>
        u.id !== senderId &&
        (u.email.toLowerCase() === query ||
          u.phone.replace(/\D/g, '') === query.replace(/\D/g, '') ||
          u.fullName.toLowerCase() === query)
    );

    if (!recipient) {
      return { success: false, error: 'Recipient user not found with that email, phone or name.' };
    }

    if (!recipient.isActive) {
      return { success: false, error: 'Recipient account is currently inactive.' };
    }

    // Deduct from sender
    this.updateUser(sender.id, { balance: sender.balance - amount });
    // Add to recipient
    this.updateUser(recipient.id, { balance: recipient.balance + amount });

    const ref = `TRF-${Date.now().toString().slice(-8)}`;

    // Debit transaction for sender
    this.addTransaction({
      userId: sender.id,
      userName: sender.fullName,
      userEmail: sender.email,
      type: 'transfer_out',
      amount,
      description: `Transferred to ${recipient.fullName} (${note || 'Peer Transfer'})`,
      referenceId: ref,
      status: 'completed',
      senderOrRecipient: recipient.fullName,
    });

    // Credit transaction for recipient
    this.addTransaction({
      userId: recipient.id,
      userName: recipient.fullName,
      userEmail: recipient.email,
      type: 'transfer_in',
      amount,
      description: `Received from ${sender.fullName} (${note || 'Peer Transfer'})`,
      referenceId: ref,
      status: 'completed',
      senderOrRecipient: sender.fullName,
    });

    // Notifications
    this.addNotification({
      userId: sender.id,
      title: 'Money Sent Successfully 💸',
      message: `You transferred ${this.formatINR(amount)} to ${recipient.fullName}.`,
      type: 'info',
    });

    this.addNotification({
      userId: recipient.id,
      title: 'Money Received! 🪙',
      message: `You received ${this.formatINR(amount)} from ${sender.fullName}.`,
      type: 'success',
    });

    return { success: true };
  },

  // --- WITHDRAWALS ---
  getWithdrawals(): WithdrawalRequest[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.WITHDRAWALS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
        return INITIAL_WITHDRAWALS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_WITHDRAWALS;
    }
  },

  saveWithdrawals(list: WithdrawalRequest[]) {
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(list));
    dispatchStorageEvent();
    CloudSync.pushAllToServer({
      users: this.getUsers(),
      transactions: this.getTransactions(),
      withdrawals: list,
      notifications: this.getNotifications(),
    }).catch(() => {});
  },

  createWithdrawalRequest(
    userId: string,
    amount: number,
    customBankDetails?: User['bankDetails']
  ): { success: boolean; request?: WithdrawalRequest; error?: string } {
    const user = this.getUserById(userId);
    if (!user) return { success: false, error: 'User not found' };
    if (!user.isActive) return { success: false, error: 'ID Inactive' };
    if (amount <= 0) return { success: false, error: 'Withdrawal amount must be greater than ₹0' };
    if (user.balance < amount) {
      return { success: false, error: `Insufficient balance. Available: ${this.formatINR(user.balance)}` };
    }

    const bankDetails = customBankDetails || user.bankDetails;
    if (!bankDetails.accountNumber || !bankDetails.ifscCode) {
      return { success: false, error: 'Complete Bank details are required to submit withdrawal.' };
    }

    // Deduct balance from user wallet (held during pending request)
    this.updateUser(userId, { balance: user.balance - amount });

    const newRequest: WithdrawalRequest = {
      id: `wdr-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone,
      amount,
      bankDetails,
      status: 'pending',
      requestedAt: new Date().toISOString(),
    };

    const list = this.getWithdrawals();
    list.unshift(newRequest);
    this.saveWithdrawals(list);

    // Record pending transaction in transaction history
    this.addTransaction({
      userId: user.id,
      userName: user.fullName,
      userEmail: user.email,
      type: 'withdrawal',
      amount,
      description: `Bank Withdrawal to ${bankDetails.bankName} (•••• ${bankDetails.accountNumber.slice(-4)})`,
      referenceId: newRequest.id.toUpperCase(),
      status: 'pending',
    });

    // Notify user
    this.addNotification({
      userId: user.id,
      title: 'Withdrawal Pending',
      message: `Your withdrawal request of ${this.formatINR(amount)} to ${bankDetails.bankName} is pending verification.`,
      type: 'info',
    });

    // Notify admin
    this.addNotification({
      userId: DEFAULT_ADMIN.id,
      title: 'New Withdrawal Request',
      message: `${user.fullName} requested ${this.formatINR(amount)} withdrawal to ${bankDetails.bankName}.`,
      type: 'alert',
    });

    return { success: true, request: newRequest };
  },

  approveWithdrawalRequest(requestId: string, adminEmail: string, remark: string = 'Approved and settled'): { success: boolean; error?: string } {
    const list = this.getWithdrawals();
    const req = list.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Withdrawal request not found' };
    if (req.status !== 'pending') return { success: false, error: `Request already ${req.status}` };

    const utrNumber = `UTR-MET-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    req.status = 'approved';
    req.utrNumber = utrNumber;
    req.adminRemark = remark;
    req.processedAt = new Date().toISOString();
    req.processedBy = adminEmail;

    this.saveWithdrawals(list);

    // Update transaction to completed with 'Withdrawal Successful' description
    const txs = this.getTransactions();
    const tx = txs.find(
      (t) =>
        t.referenceId === req.id.toUpperCase() ||
        t.id === `tx-${req.id}` ||
        (t.type === 'withdrawal' && t.userId === req.userId && t.status === 'pending')
    );
    if (tx) {
      tx.status = 'completed';
      tx.description = `Withdrawal Successful - ${req.bankDetails.bankName} (•••• ${req.bankDetails.accountNumber.slice(-4)})`;
      tx.adminRemark = `Settled (UTR: ${utrNumber})`;
      this.saveTransactions(txs);
    }

    // Notify user
    this.addNotification({
      userId: req.userId,
      title: 'Withdrawal Successful',
      message: `Your withdrawal of ${this.formatINR(req.amount)} to ${req.bankDetails.bankName} has been approved and settled successfully. UTR: ${utrNumber}`,
      type: 'success',
    });

    return { success: true };
  },

  rejectWithdrawalRequest(requestId: string, adminEmail: string, remark: string): { success: boolean; error?: string } {
    const list = this.getWithdrawals();
    const req = list.find((r) => r.id === requestId);
    if (!req) return { success: false, error: 'Withdrawal request not found' };
    if (req.status !== 'pending') return { success: false, error: `Request already ${req.status}` };

    req.status = 'rejected';
    req.adminRemark = remark || 'Rejected by Admin. Funds restored to account balance.';
    req.processedAt = new Date().toISOString();
    req.processedBy = adminEmail;

    this.saveWithdrawals(list);

    // Refund money to user's wallet
    const user = this.getUserById(req.userId);
    if (user) {
      this.updateUser(user.id, { balance: user.balance + req.amount });
    }

    // Update transaction to failed with 'Withdrawal Failed' description
    const txs = this.getTransactions();
    const tx = txs.find(
      (t) =>
        t.referenceId === req.id.toUpperCase() ||
        t.id === `tx-${req.id}` ||
        (t.type === 'withdrawal' && t.userId === req.userId && t.status === 'pending')
    );
    if (tx) {
      tx.status = 'failed';
      tx.description = `Withdrawal Failed - ${req.bankDetails.bankName} (Funds Refunded)`;
      tx.adminRemark = `Rejected: ${remark || 'Admin rejection'} (Funds restored)`;
      this.saveTransactions(txs);
    }

    // Notify user
    this.addNotification({
      userId: req.userId,
      title: 'Withdrawal Failed',
      message: `Your withdrawal of ${this.formatINR(req.amount)} failed: "${remark || 'Account verification issue'}". Funds have been restored to your account balance.`,
      type: 'warning',
    });

    return { success: true };
  },

  // --- TRANSACTIONS ---
  getTransactions(): Transaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
        return INITIAL_TRANSACTIONS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  },

  saveTransactions(txs: Transaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txs));
    dispatchStorageEvent();
    CloudSync.pushAllToServer({
      users: this.getUsers(),
      transactions: txs,
      withdrawals: this.getWithdrawals(),
      notifications: this.getNotifications(),
    }).catch(() => {});
  },

  addTransaction(txData: Omit<Transaction, 'id' | 'createdAt'>): Transaction {
    const txs = this.getTransactions();
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      createdAt: new Date().toISOString(),
    };
    txs.unshift(newTx);
    this.saveTransactions(txs);
    return newTx;
  },

  getTransactionsByUserId(userId: string): Transaction[] {
    return this.getTransactions().filter((t) => t.userId === userId);
  },

  // --- NOTIFICATIONS ---
  cleanNotificationText(text: string): string {
    if (!text) return '';
    return text
      .replace(/pending\s*admin\s*review/gi, 'pending verification')
      .replace(/pending\s*admin\s*approval/gi, 'pending verification')
      .replace(/admin\s*review/gi, 'verification')
      .replace(/admin\s*approval/gi, 'verification')
      .replace(/super\s*admin/gi, 'System')
      .replace(/rejected\s*by\s*admin/gi, 'Rejected')
      .replace(/approved\s*by\s*admin/gi, 'Approved')
      .replace(/by\s*admin/gi, '')
      .replace(/admin/gi, '')
      .replace(/এডমিন/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  },

  getNotifications(userId?: string): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      const list: NotificationItem[] = data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;

      // Filter out unwanted system status and welcome notifications
      const cleaned = list.filter((n) => {
        const text = `${n.title} ${n.message}`.toLowerCase();
        if (
          text.includes('de-active') ||
          text.includes('inactive') ||
          text.includes('account active') ||
          text.includes('welcome') ||
          text.includes('account created') ||
          text.includes('status is now')
        ) {
          return false;
        }
        return true;
      });

      if (data && cleaned.length !== list.length) {
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(cleaned));
      }

      const filtered = !userId ? cleaned : cleaned.filter((n) => n.userId === 'all' || n.userId === userId);
      return filtered.map((n) => ({
        ...n,
        title: this.cleanNotificationText(n.title),
        message: this.cleanNotificationText(n.message),
      }));
    } catch {
      return INITIAL_NOTIFICATIONS.map((n) => ({
        ...n,
        title: this.cleanNotificationText(n.title),
        message: this.cleanNotificationText(n.message),
      }));
    }
  },

  saveNotifications(list: NotificationItem[]) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(list));
    dispatchStorageEvent();
  },

  addNotification(notif: Omit<NotificationItem, 'id' | 'isRead' | 'createdAt'>): NotificationItem {
    const list = this.getNotifications();
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    list.unshift(newNotif);
    this.saveNotifications(list);
    return newNotif;
  },

  markNotificationAsRead(id: string) {
    const list = this.getNotifications();
    const item = list.find((n) => n.id === id);
    if (item) {
      item.isRead = true;
      this.saveNotifications(list);
    }
  },

  markAllNotificationsAsRead(userId: string) {
    const list = this.getNotifications();
    list.forEach((n) => {
      if (n.userId === 'all' || n.userId === userId) {
        n.isRead = true;
      }
    });
    this.saveNotifications(list);
  },

  // --- STATS FOR ADMIN ---
  getPlatformStats(): PlatformStats {
    const users = this.getUsers().filter((u) => u.role === 'user');
    const withdrawals = this.getWithdrawals();
    const transactions = this.getTransactions();

    const activeUsers = users.filter((u) => u.isActive && !u.isDeleted).length;
    const inactiveUsers = users.filter((u) => !u.isActive || u.isDeleted).length;
    const totalSystemBalance = users.reduce((acc, u) => acc + (u.balance || 0), 0);

    const pendingWithdrawals = withdrawals.filter((w) => w.status === 'pending');
    const approvedWithdrawals = withdrawals.filter((w) => w.status === 'approved');

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      totalSystemBalance,
      totalWithdrawalsProcessed: approvedWithdrawals.reduce((sum, w) => sum + w.amount, 0),
      pendingWithdrawalsCount: pendingWithdrawals.length,
      pendingWithdrawalsAmount: pendingWithdrawals.reduce((sum, w) => sum + w.amount, 0),
      totalTransactionsCount: transactions.length,
    };
  },

  // Currency Formatter helper for ₹ INR
  formatINR(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  },

  // Reset to initial mock data
  resetDatabase() {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(INITIAL_TRANSACTIONS));
    localStorage.setItem(STORAGE_KEYS.WITHDRAWALS, JSON.stringify(INITIAL_WITHDRAWALS));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, DEFAULT_ADMIN.id);
    dispatchStorageEvent();
  }
};
