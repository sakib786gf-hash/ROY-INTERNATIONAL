import { User, Transaction, WithdrawalRequest, NotificationItem } from '../types';

// Global Cloud Sync Endpoint - Supported everywhere with CORS *
const RESTFUL_CLOUD_ENDPOINT = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1081ad0e97603';

export const CloudSync = {
  // Pull latest users and records from global cloud / server into local state
  async syncFromServer(): Promise<{
    success: boolean;
    users?: User[];
    transactions?: Transaction[];
    withdrawals?: WithdrawalRequest[];
    notifications?: NotificationItem[];
  }> {
    // 1. Try Global Cloud REST API first (works on Vercel, phones, PC, any origin)
    try {
      const res = await fetch(RESTFUL_CLOUD_ENDPOINT, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.data) {
          const parsedUsers: User[] = [];
          const parsedTransactions: Transaction[] = [];
          const parsedWithdrawals: WithdrawalRequest[] = [];
          const parsedNotifications: NotificationItem[] = [];

          for (const [key, val] of Object.entries(body.data)) {
            if (typeof val === 'string') {
              try {
                const parsed = JSON.parse(val);
                if (key.startsWith('u')) {
                  // Never pull SS Metal User per user explicit instruction
                  if (
                    parsed.id === 'user-ss-8910642' ||
                    (parsed.email && parsed.email.toLowerCase() === 'ss8910642@gmail.com')
                  ) {
                    continue;
                  }
                  // Ensure default photo if missing
                  if (!parsed.photoUrl) {
                    parsed.photoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(parsed.fullName || 'User')}&background=0284c7&color=fff`;
                  }
                  parsedUsers.push(parsed);
                } else if (key.startsWith('t')) {
                  parsedTransactions.push(parsed);
                } else if (key.startsWith('w')) {
                  parsedWithdrawals.push(parsed);
                } else if (key.startsWith('n')) {
                  parsedNotifications.push(parsed);
                }
              } catch {
                // Ignore parse errors on individual keys
              }
            }
          }

          if (parsedUsers.length > 0) {
            return {
              success: true,
              users: parsedUsers,
              transactions: parsedTransactions,
              withdrawals: parsedWithdrawals,
              notifications: parsedNotifications,
            };
          }
        }
      }
    } catch {
      // Ignore network errors
    }

    // 2. Fallback to same-origin /api/sync if running in Express Node server
    try {
      const res = await fetch('/api/sync', {
        headers: { 'Content-Type': 'application/json' },
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        const data = await res.json();
        if (data.success) {
          return {
            success: true,
            users: data.users || [],
            transactions: data.transactions || [],
            withdrawals: data.withdrawals || [],
            notifications: data.notifications || [],
          };
        }
      }
    } catch {
      // Offline / standalone mode
    }

    return { success: false };
  },

  // Push all changes (users, withdrawals, transactions) to global cloud and backend
  async pushAllToServer(payload: {
    users?: User[];
    transactions?: Transaction[];
    withdrawals?: WithdrawalRequest[];
    notifications?: NotificationItem[];
  }): Promise<boolean> {
    let cloudSaved = false;

    // 1. Pack individual items compactly to stay well under cloud size limits
    try {
      const dataObj: Record<string, string> = {};

      if (Array.isArray(payload.users)) {
        const cleanUsers = payload.users.filter((u) => {
          if (!u || !u.id) return false;
          const uId = u.id.toLowerCase();
          const uEmail = (u.email || '').toLowerCase();
          if (uId === 'user-ss-8910642' || uEmail === 'ss8910642@gmail.com') return false;
          if (u.isDeleted) return false;
          return true;
        });

        cleanUsers.forEach((u, i) => {
          const compactUser: Record<string, any> = {
            id: u.id,
            fullName: u.fullName,
            email: u.email,
            phone: u.phone,
            password: u.password,
            role: u.role,
            balance: u.balance || 0,
            isActive: u.isActive !== false,
          };
          if (u.photoUrl && !u.photoUrl.startsWith('data:')) {
            compactUser.photoUrl = u.photoUrl;
          }
          if (u.aadhaarNumber) compactUser.aadhaarNumber = u.aadhaarNumber;
          if (u.panNumber) compactUser.panNumber = u.panNumber;
          if (u.bankDetails?.accountNumber) {
            compactUser.bankDetails = u.bankDetails;
          }
          dataObj[`u${i}`] = JSON.stringify(compactUser);
        });
      }

      if (Array.isArray(payload.transactions)) {
        const recentTxs = payload.transactions.slice(0, 8);
        recentTxs.forEach((tx, i) => {
          const compactTx = {
            id: tx.id,
            userId: tx.userId,
            userName: tx.userName,
            userEmail: tx.userEmail,
            type: tx.type,
            amount: tx.amount,
            description: tx.description,
            status: tx.status,
            createdAt: tx.createdAt,
          };
          dataObj[`t${i}`] = JSON.stringify(compactTx);
        });
      }

      if (Array.isArray(payload.withdrawals)) {
        const recentWdrs = payload.withdrawals.slice(0, 5);
        recentWdrs.forEach((w, i) => {
          dataObj[`w${i}`] = JSON.stringify(w);
        });
      }

      const res = await fetch(RESTFUL_CLOUD_ENDPOINT, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Metal Cloud Master DB',
          data: dataObj,
        }),
      });

      cloudSaved = res.ok;
    } catch {
      // Network error on cloud API
    }

    // 2. Also push to local server API if running Node backend
    try {
      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch {
      // Standalone mode
    }

    return cloudSaved;
  },

  // Save single user
  async saveUserToServer(user: User): Promise<boolean> {
    try {
      const current = await this.syncFromServer();
      const users = current.users || [];
      const idx = users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
      if (idx !== -1) {
        users[idx] = user;
      } else {
        users.push(user);
      }
      return await this.pushAllToServer({ ...current, users });
    } catch {
      return false;
    }
  },

  // Cross-device login verification via server API
  async loginViaServer(userId: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // 1. Try local server endpoint if on Express backend
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      const cType = res.headers.get('content-type') || '';
      if (res.ok && cType.includes('application/json')) {
        return await res.json();
      }
    } catch {
      // Server offline / Vercel static mode
    }

    // 2. Verify against global cloud database
    try {
      const cloudData = await this.syncFromServer();
      if (cloudData.success && Array.isArray(cloudData.users)) {
        const cleanInput = userId.trim().toLowerCase();
        const cleanDigits = cleanInput.replace(/\D/g, '');
        const target = cloudData.users.find((u) =>
          u.email.toLowerCase() === cleanInput ||
          u.email.toLowerCase().split('@')[0] === cleanInput ||
          (cleanDigits.length === 10 && u.phone?.replace(/\D/g, '').endsWith(cleanDigits)) ||
          (cleanDigits.length === 12 && u.aadhaarNumber?.replace(/\D/g, '') === cleanDigits) ||
          (u.panNumber && u.panNumber.toLowerCase() === cleanInput) ||
          u.id.toLowerCase() === cleanInput
        );

        if (target) {
          const passMatch =
            target.password === password.trim() ||
            target.password?.toLowerCase() === password.trim().toLowerCase();
          if (passMatch) {
            return { success: true, user: target };
          } else {
            return { success: false, error: 'Incorrect password for this user ID.' };
          }
        }
      }
    } catch {
      // Fall through
    }

    return { success: false, error: 'Server unavailable' };
  },
};
