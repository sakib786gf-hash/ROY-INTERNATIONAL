/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { SpaceBackground } from './components/common/SpaceBackground';
import { Navbar } from './components/common/Navbar';
import { NotificationBar } from './components/common/NotificationBar';
import { AuthPage } from './components/auth/AuthPage';
import { UserDashboard } from './components/user/UserDashboard';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AddMoneyModal } from './components/wallet/AddMoneyModal';
import { WithdrawMoneyModal } from './components/wallet/WithdrawMoneyModal';
import { SendMoneyModal } from './components/wallet/SendMoneyModal';
import { StorageService } from './services/storage';
import { User, Transaction, WithdrawalRequest, NotificationItem, PlatformStats } from './types';

export default function App() {
  // Rule: When clicking/touching the link from any phone, always open login page first
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoggedOut, setIsLoggedOut] = useState<boolean>(true);

  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [transactions, setTransactions] = useState<Transaction[]>(() => StorageService.getTransactions());
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(() => StorageService.getWithdrawals());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    StorageService.getNotifications(currentUser?.id)
  );
  const [stats, setStats] = useState<PlatformStats>(() => StorageService.getPlatformStats());

  // Modals
  const [isAddMoneyOpen, setIsAddMoneyOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isSendMoneyOpen, setIsSendMoneyOpen] = useState(false);

  // Refresh all state from StorageService
  const refreshAllData = useCallback(() => {
    const allUsers = StorageService.getUsers();
    setUsers(allUsers);
    setTransactions(StorageService.getTransactions());
    setWithdrawals(StorageService.getWithdrawals());
    setStats(StorageService.getPlatformStats());

    const curId = StorageService.getCurrentUserId();
    const updatedCur = allUsers.find((u) => u.id === curId) || null;
    if (updatedCur) {
      setCurrentUser(updatedCur);
      setNotifications(StorageService.getNotifications(updatedCur.id));
    }
  }, []);

  // Sync listener for storage changes and cross-device server sync
  useEffect(() => {
    // Initial sync with backend server
    StorageService.syncWithServer().then(() => {
      refreshAllData();
    });

    const handleDataChanged = () => {
      refreshAllData();
    };

    const handleFocus = () => {
      StorageService.syncWithServer().then(() => {
        refreshAllData();
      });
    };

    window.addEventListener('metal_wallet_data_changed', handleDataChanged);
    window.addEventListener('focus', handleFocus);
    
    // Periodic background sync every 12 seconds
    const interval = setInterval(() => {
      StorageService.syncWithServer().then(() => {
        refreshAllData();
      });
    }, 12000);

    return () => {
      window.removeEventListener('metal_wallet_data_changed', handleDataChanged);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [refreshAllData]);

  // Account switch / login
  const handleUserLoginSuccess = (user: User) => {
    setIsLoggedOut(false);
    StorageService.setCurrentUserId(user.id);
    setCurrentUser(user);
    setNotifications(StorageService.getNotifications(user.id));
    refreshAllData();
  };

  const handleLogout = () => {
    setIsLoggedOut(true);
    setCurrentUser(null);
    StorageService.setCurrentUserId('');
  };

  const handleResetData = () => {
    if (confirm('Reset simulated database back to initial defaults?')) {
      StorageService.resetDatabase();
      refreshAllData();
    }
  };

  // If user is logged out or no current user, show the exact AuthPage (Admin registers users)
  if (isLoggedOut || !currentUser) {
    return (
      <SpaceBackground>
        <AuthPage
          onSuccess={handleUserLoginSuccess}
        />
      </SpaceBackground>
    );
  }

  return (
    <SpaceBackground>
      {/* Rule 9: Notification Bar / Top Ticker */}
      <NotificationBar
        notifications={notifications}
        currentUserId={currentUser.id}
        onRefresh={refreshAllData}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentUser.role === 'admin' ? (
          <AdminDashboard
            currentUser={currentUser}
            users={users}
            withdrawals={withdrawals}
            transactions={transactions}
            stats={stats}
            onRefreshData={refreshAllData}
            onLogout={handleLogout}
          />
        ) : (
          /* Exact User Dashboard matching Screenshot_20260920_223609.jpg */
          <UserDashboard
            currentUser={currentUser}
            transactions={transactions}
            withdrawals={withdrawals}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
            onRefreshData={refreshAllData}
            onLogout={handleLogout}
            onOpenNotifications={() => {
              const btn = document.querySelector('[title="Dismiss notification bar"]');
              if (btn) (btn as HTMLElement).click();
            }}
          />
        )}
      </main>

      {/* Modals */}
      <AddMoneyModal
        isOpen={isAddMoneyOpen}
        onClose={() => setIsAddMoneyOpen(false)}
        currentUser={currentUser}
        onSuccess={refreshAllData}
      />

      <WithdrawMoneyModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        currentUser={currentUser}
        onSuccess={refreshAllData}
      />

      <SendMoneyModal
        isOpen={isSendMoneyOpen}
        onClose={() => setIsSendMoneyOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        onSuccess={refreshAllData}
      />
    </SpaceBackground>
  );
}
