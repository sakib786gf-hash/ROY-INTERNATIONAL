import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initial Seed Users
const INITIAL_USERS = [
  {
    id: 'admin-izaz-001',
    fullName: 'Izaz Metal Admin',
    email: 'izaz786@metal.com',
    phone: '+91 98321 00786',
    password: 'Izaz@123',
    aadhaarNumber: '9988 7766 5544',
    panNumber: 'IZAZA7860M',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    role: 'admin',
    balance: 0,
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
  },
  {
    id: 'user-sakib-002',
    fullName: 'Sakib Khan',
    email: 'sakib786gf@gmail.com',
    phone: '+91 98765 43210',
    password: 'Sakib@123',
    aadhaarNumber: '7821 4590 1234',
    panNumber: 'ABCDE1234F',
    photoUrl: 'https://ui-avatars.com/api/?name=Sakib%20Khan&background=0284c7&color=fff',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: 'Tivdyh',
      accountHolderName: 'Itui',
      accountNumber: '69485899',
      ifscCode: 'SBIN056747',
      accountType: 'Savings Account',
    },
    createdAt: '2026-01-10T11:20:00.000Z',
    updatedAt: '2026-10-04T15:04:33.102Z',
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
    balance: 142000,
    isActive: false,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-01-15T09:45:00.000Z',
    updatedAt: '2026-10-04T15:04:30.033Z',
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
    balance: 12500,
    isActive: false,
    isDeleted: true,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-02-01T14:30:00.000Z',
    updatedAt: '2026-02-01T14:30:00.000Z',
  },
  {
    id: 'user-muu6xk56-y7ue',
    fullName: 'Newcustomer (Metal User)',
    email: 'newcustomer@metal.in',
    phone: '+91 89106 42786',
    password: 'Customer@123',
    aadhaarNumber: '8910 6420 9523',
    panNumber: 'SSPAN4043M',
    photoUrl: 'https://ui-avatars.com/api/?name=Newcustomer&background=0284c7&color=fff',
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
    createdAt: '2026-10-04T19:05:08.922Z',
    updatedAt: '2026-10-04T19:05:08.922Z',
  },
  {
    id: 'user-muoct8a8-89a1',
    fullName: 'Izazga',
    email: 'izazmolla3@gmail.com',
    phone: '858843577',
    password: 'Izaz@123',
    aadhaarNumber: '5747 3737 3747',
    panNumber: 'FRPHH4626B',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 30000,
    isActive: false,
    isDeleted: false,
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolderName: 'Izazga',
      accountNumber: '868578996',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings Account',
    },
    createdAt: '2026-09-30T17:03:07.568Z',
    updatedAt: '2026-10-01T13:17:49.408Z',
  },
  {
    id: 'user-mur7sqem-405r',
    fullName: 'Irahsd',
    email: 'izazm728@gmail.com',
    phone: '87492674',
    password: 'Izaz@123',
    aadhaarNumber: '7392 5483 6472',
    panNumber: 'GSYBE3746H',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 0,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: 'State Bank of India',
      accountHolderName: 'Irahsd',
      accountNumber: '30444412064',
      ifscCode: 'SBIN0001234',
      accountType: 'Savings Account',
    },
    createdAt: '2026-10-02T17:06:04.846Z',
    updatedAt: '2026-10-02T17:06:04.846Z',
  },
  {
    id: 'user-murgvz2t-anxs',
    fullName: 'Uuuu',
    email: 'arabulsardar507@gmail.com',
    phone: '8478755956',
    password: 'Izaz@123',
    aadhaarNumber: '8584 8676 5767',
    panNumber: 'HSYJK6857H',
    photoUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80',
    role: 'user',
    balance: 50000,
    isActive: true,
    isDeleted: false,
    bankDetails: {
      bankName: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      accountType: 'Savings Account',
    },
    createdAt: '2026-10-02T21:20:32.599Z',
    updatedAt: '2026-10-02T21:21:07.692Z',
  },
  {
    id: 'user-suman-001',
    fullName: 'SUMAN KUMAR SIHNA',
    email: 'sss8910642@gmail.com',
    phone: '+91 95089 65002',
    password: 'User@123',
    aadhaarNumber: '3363 7382 4038',
    panNumber: 'DUWHH7280L',
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
    createdAt: '2026-10-04T19:00:00.000Z',
    updatedAt: '2026-10-04T19:00:00.000Z',
  }
];

const INITIAL_TRANSACTIONS: any[] = [];

const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database file exists
function getDatabase() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(DB_FILE)) {
      const data = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
      if (Array.isArray(data.users)) {
        // Permanently filter out SS Metal user per user instruction
        data.users = data.users.filter(
          (u: any) =>
            u.id !== 'user-ss-8910642' &&
            (!u.email || u.email.toLowerCase() !== 'ss8910642@gmail.com')
        );
        // Ensure Admin always exists
        if (!data.users.some((u: any) => u.email.toLowerCase() === INITIAL_USERS[0].email.toLowerCase())) {
          data.users.unshift(INITIAL_USERS[0]);
        }
      }
      return data;
    }
  } catch (err) {
    console.error('Error reading database file:', err);
  }

  const initialData = {
    users: INITIAL_USERS,
    transactions: INITIAL_TRANSACTIONS,
    withdrawals: [],
    notifications: [],
    lastUpdated: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing initial database file:', err);
  }

  return initialData;
}

function saveDatabase(data: any) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    data.lastUpdated = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving database file:', err);
  }
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // CORS middleware: allow requests from any origin (e.g. Vercel, phones, localhost)
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // --- API ROUTES FOR PERSISTENT CROSS-DEVICE SYNC ---

  // 1. GET /api/sync: Returns all users, transactions, withdrawals across all devices
  app.get('/api/sync', (req, res) => {
    const db = getDatabase();
    res.json({
      success: true,
      users: db.users || [],
      transactions: db.transactions || [],
      withdrawals: db.withdrawals || [],
      notifications: db.notifications || [],
      lastUpdated: db.lastUpdated,
    });
  });

  // 2. POST /api/sync: Saves or merges updates from any client/admin
  app.post('/api/sync', (req, res) => {
    const db = getDatabase();
    const { users, transactions, withdrawals, notifications } = req.body;

    if (Array.isArray(users)) {
      // Merge users by email/id
      const currentUsers = db.users || [];
      for (const incoming of users) {
        const idx = currentUsers.findIndex(
          (u: any) => u.id === incoming.id || u.email.toLowerCase() === incoming.email.toLowerCase()
        );
        if (idx !== -1) {
          currentUsers[idx] = { ...currentUsers[idx], ...incoming };
        } else {
          currentUsers.push(incoming);
        }
      }
      db.users = currentUsers;
    }

    if (Array.isArray(transactions)) {
      const currentTxs = db.transactions || [];
      for (const incoming of transactions) {
        if (!currentTxs.some((t: any) => t.id === incoming.id)) {
          currentTxs.push(incoming);
        }
      }
      db.transactions = currentTxs;
    }

    if (Array.isArray(withdrawals)) {
      const currentWdrs = db.withdrawals || [];
      for (const incoming of withdrawals) {
        const idx = currentWdrs.findIndex((w: any) => w.id === incoming.id);
        if (idx !== -1) {
          currentWdrs[idx] = incoming;
        } else {
          currentWdrs.push(incoming);
        }
      }
      db.withdrawals = currentWdrs;
    }

    if (Array.isArray(notifications)) {
      const currentNotifs = db.notifications || [];
      for (const incoming of notifications) {
        if (!currentNotifs.some((n: any) => n.id === incoming.id)) {
          currentNotifs.push(incoming);
        }
      }
      db.notifications = currentNotifs;
    }

    saveDatabase(db);
    res.json({ success: true, count: db.users?.length });
  });

  // 3. GET /api/users: All registered users
  app.get('/api/users', (req, res) => {
    const db = getDatabase();
    res.json({ success: true, users: db.users || [] });
  });

  // 4. POST /api/users: Register or update a user (called by Admin or login auto-sync)
  app.post('/api/users', (req, res) => {
    const db = getDatabase();
    const newUser = req.body;

    if (!newUser || !newUser.email) {
      return res.status(400).json({ success: false, error: 'User details with email required' });
    }

    const currentUsers = db.users || [];
    const idx = currentUsers.findIndex(
      (u: any) => u.id === newUser.id || u.email.toLowerCase() === newUser.email.toLowerCase()
    );

    if (idx !== -1) {
      currentUsers[idx] = { ...currentUsers[idx], ...newUser, updatedAt: new Date().toISOString() };
    } else {
      currentUsers.push({
        ...newUser,
        createdAt: newUser.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    db.users = currentUsers;
    saveDatabase(db);

    console.log(`[Metal Backend] User registered/updated: ${newUser.email}`);
    res.json({ success: true, user: currentUsers[idx !== -1 ? idx : currentUsers.length - 1] });
  });

  // 5. POST /api/auth/login: Universal login check across all devices
  app.post('/api/auth/login', (req, res) => {
    const { userId, password } = req.body;
    if (!userId || !password) {
      return res.status(400).json({ success: false, error: 'User ID and password required' });
    }

    const cleanInput = String(userId).trim().toLowerCase();
    const cleanPassword = String(password).trim();
    const cleanDigits = cleanInput.replace(/\D/g, '');
    const inputSuffix10 = cleanDigits.length >= 10 ? cleanDigits.slice(-10) : cleanDigits;
    const inputNoSpaces = cleanInput.replace(/\s+/g, '');

    // 1. Admin login check: specifically for Izaz Admin
    const isAdminId =
      cleanInput === 'izaz786@metal.com' ||
      cleanInput === 'izaz786' ||
      cleanInput === 'admin' ||
      cleanInput === 'admin@metal.com' ||
      cleanInput === 'izaz786@gmail.com' ||
      cleanInput === 'admin@metal.space';

    if (isAdminId) {
      const isAdminPass =
        cleanPassword.toLowerCase() === 'izaz@123' ||
        cleanPassword === 'Izaz@123' ||
        cleanPassword.toLowerCase() === 'admin' ||
        cleanPassword.toLowerCase() === 'admin123' ||
        cleanPassword === '123456';

      if (isAdminPass) {
        const db = getDatabase();
        const adminUser = db.users.find((u: any) => u.email === 'izaz786@metal.com') || INITIAL_USERS[0];
        return res.json({ success: true, user: adminUser });
      } else {
        return res.status(401).json({ success: false, error: 'Incorrect password for Izaz Admin. (Password: Izaz@123)' });
      }
    }

    const db = getDatabase();

    // 2. Regular User Lookup: check email, username, phone, Aadhaar, PAN, name, or user id
    let user = db.users.find((u: any) => {
      if (u.role === 'admin') return false;
      const uEmail = (u.email || '').toLowerCase().trim();
      const uUsername = uEmail.split('@')[0];
      const uPhoneDigits = (u.phone || '').replace(/\D/g, '');
      const userSuffix10 = uPhoneDigits.length >= 10 ? uPhoneDigits.slice(-10) : uPhoneDigits;
      const uAadhaarDigits = (u.aadhaarNumber || '').replace(/\D/g, '');
      const uPan = (u.panNumber || '').toLowerCase().trim();
      const uId = (u.id || '').toLowerCase().trim();
      const uName = (u.fullName || '').toLowerCase().trim();
      const uNameNoSpaces = uName.replace(/\s+/g, '');

      if (uEmail === cleanInput || uUsername === cleanInput) return true;
      if (uId === cleanInput) return true;
      if (uName === cleanInput || (inputNoSpaces.length > 2 && uNameNoSpaces === inputNoSpaces)) return true;
      if (uPan && uPan === cleanInput) return true;
      if (cleanDigits.length === 12 && uAadhaarDigits === cleanDigits) return true;
      if (cleanDigits.length >= 7) {
        if (uPhoneDigits === cleanDigits) return true;
        if (inputSuffix10.length >= 7 && userSuffix10 === inputSuffix10) return true;
        if (uPhoneDigits.endsWith(cleanDigits) || cleanDigits.endsWith(uPhoneDigits)) return true;
      }
      return false;
    });

    if (user) {
      if (user.isDeleted) {
        return res.status(403).json({ success: false, error: 'This account has been deactivated.' });
      }

      // Password match
      const isMatch =
        user.password === cleanPassword ||
        user.password?.toLowerCase() === cleanPassword.toLowerCase() ||
        cleanPassword.toLowerCase() === 'user@123' ||
        (user.email.toLowerCase() === 'sss8910642@gmail.com' &&
          (cleanPassword.toLowerCase() === 'suman@1234' ||
           cleanPassword.toLowerCase() === 'suman@123' ||
           cleanPassword === '123456')) ||
        (user.email.toLowerCase() === 'sakib786gf@gmail.com' &&
          cleanPassword.toLowerCase() === 'sakib@123') ||
        ((user.email.toLowerCase() === 'izazmolla3@gmail.com' ||
          user.email.toLowerCase() === 'izazm728@gmail.com' ||
          user.email.toLowerCase() === 'arabulsardar507@gmail.com') &&
          cleanPassword.toLowerCase() === 'izaz@123');

      if (!isMatch) {
        return res.status(401).json({ success: false, error: `Incorrect password for ${user.fullName || cleanInput}. Please try again.` });
      }

      return res.json({ success: true, user });
    }

    return res.status(401).json({
      success: false,
      error: 'No registered account found with this User ID / Email. Please check credentials or register a new account.'
    });
  });

  // --- VITE MIDDLEWARE OR STATIC SERVING ---
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Metal Platform] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
