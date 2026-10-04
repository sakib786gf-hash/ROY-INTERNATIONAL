import { User, Transaction, WithdrawalRequest, NotificationItem } from '../types';

export const CloudSync = {
  // Pull latest users and records from server into local state
  async syncFromServer(): Promise<{
    success: boolean;
    users?: User[];
    transactions?: Transaction[];
    withdrawals?: WithdrawalRequest[];
    notifications?: NotificationItem[];
  }> {
    try {
      const res = await fetch('/api/sync', {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return { success: false };
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
    } catch {
      // Offline / standalone mode
    }
    return { success: false };
  },

  // Push a newly registered user to the backend server
  async saveUserToServer(user: User): Promise<boolean> {
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        const json = await res.json();
        return json.success === true;
      }
    } catch {
      // Offline mode
    }
    return false;
  },

  // Push all changes (users, withdrawals, transactions) to backend
  async pushAllToServer(payload: {
    users?: User[];
    transactions?: Transaction[];
    withdrawals?: WithdrawalRequest[];
    notifications?: NotificationItem[];
  }): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Cross-device login verification via server API
  async loginViaServer(userId: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, password }),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err?.message || 'Server unavailable' };
    }
  },
};
