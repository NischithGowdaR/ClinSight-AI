import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { User, findUserByEmail, saveUser } from './db';

const JWT_SECRET = process.env.JWT_SECRET || 'clinsight-secret-key-change-in-production';
const SALT_ROUNDS = 10;

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcryptjs.hash(password, SALT_ROUNDS);
}

// Verify password
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash);
}

// Generate JWT token
export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    { userId, email, role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// Verify JWT token
export function verifyToken(token: string): { userId: string; email: string; role: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      role: string;
    };
    return decoded;
  } catch {
    return null;
  }
}

// Create new user
export async function createUser(
  email: string,
  password: string,
  name: string,
  role: 'doctor' | 'patient'
): Promise<User> {
  if (findUserByEmail(email)) {
    throw new Error('Email already registered');
  }

  const userId = `${role}-${Date.now()}`;
  const passwordHash = await hashPassword(password);

  const newUser: User = {
    id: userId,
    email,
    passwordHash,
    name,
    role,
    createdAt: new Date(),
  };

  saveUser(newUser);
  return newUser;
}
