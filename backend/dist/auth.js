"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPassword = hashPassword;
exports.verifyPassword = verifyPassword;
exports.generateToken = generateToken;
exports.verifyToken = verifyToken;
exports.createUser = createUser;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("./db");
const JWT_SECRET = process.env.JWT_SECRET || 'clinsight-secret-key-change-in-production';
const SALT_ROUNDS = 10;
// Hash password
async function hashPassword(password) {
    return bcryptjs_1.default.hash(password, SALT_ROUNDS);
}
// Verify password
async function verifyPassword(password, hash) {
    return bcryptjs_1.default.compare(password, hash);
}
// Generate JWT token
function generateToken(userId, email, role) {
    return jsonwebtoken_1.default.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
}
// Verify JWT token
function verifyToken(token) {
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        return decoded;
    }
    catch {
        return null;
    }
}
// Create new user
async function createUser(email, password, name, role) {
    if ((0, db_1.findUserByEmail)(email)) {
        throw new Error('Email already registered');
    }
    const userId = `${role}-${Date.now()}`;
    const passwordHash = await hashPassword(password);
    const newUser = {
        id: userId,
        email,
        passwordHash,
        name,
        role,
        createdAt: new Date(),
    };
    (0, db_1.saveUser)(newUser);
    return newUser;
}
