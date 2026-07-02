import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { findUserByEmail, findUserById, userStore } from './db';
import { verifyToken, generateToken, createUser, hashPassword } from './auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Initialize with demo users on start
async function initializeDemoUsers() {
  const demoUsers = [
    {
      id: 'doctor-1',
      email: 'dr.rajesh@clinsight.com',
      password: 'password123',
      name: 'Dr. Rajesh Kumar',
      role: 'doctor' as const,
    },
    {
      id: 'doctor-2',
      email: 'dr.priya@clinsight.com',
      password: 'password123',
      name: 'Dr. Priya Sharma',
      role: 'doctor' as const,
    },
    {
      id: 'patient-1',
      email: 'patient@clinsight.com',
      password: 'password123',
      name: 'John Doe',
      role: 'patient' as const,
    },
  ];

  for (const user of demoUsers) {
    if (!userStore.has(user.id)) {
      const passwordHash = await hashPassword(user.password);
      userStore.set(user.id, {
        id: user.id,
        email: user.email,
        passwordHash,
        name: user.name,
        role: user.role,
        createdAt: new Date(),
      });
      console.log(`[db] Demo user initialized: ${user.email}`);
    }
  }
}

// Middlwares
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(cookieParser());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const token = req.cookies['auth-token'];
  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  const user = findUserById(decoded.userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    }
  });
});

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (role !== 'doctor' && role !== 'patient') {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const newUser = await createUser(email, password, name, role);
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(201).json({
      message: 'Signup successful',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    return res.status(400).json({ error: message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const bcryptjs = require('bcryptjs');
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = generateToken(user.id, user.email, user.role);

    res.cookie('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Login failed';
    return res.status(500).json({ error: message });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth-token');
  return res.json({ message: 'Logout successful' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Bootstrap server
initializeDemoUsers()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`[server] Backend running on port ${PORT}`);
      console.log(`[server] CORS configured for ${FRONTEND_URL}`);
    });
  })
  .catch(err => {
    console.error('[server] Bootstrapping failed:', err);
    process.exit(1);
  });
