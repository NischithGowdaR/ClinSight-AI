# ClinSight AI - Authentication System Documentation

## Overview

The ClinSight AI platform now includes a complete role-based authentication system with secure login and signup flows for both doctors and patients.

## Features

- **Role-Based Access Control**: Separate login/signup for doctors and patients
- **JWT-Based Sessions**: Secure token-based authentication with httpOnly cookies
- **Password Hashing**: bcryptjs for secure password storage
- **Route Protection**: Middleware-based route protection with automatic redirects
- **In-Memory User Store**: Demo mode with pre-populated users (easily replaceable with database)
- **Responsive Design**: Mobile-friendly login and signup pages
- **Type-Safe**: Full TypeScript support

## Architecture

### API Routes

```
POST /api/auth/signup        - Register new user
POST /api/auth/login         - Authenticate user and create session
POST /api/auth/logout        - Clear session and logout
GET  /api/auth/me            - Get current authenticated user
```

### Protected Routes

- `/doctor` - Doctor dashboard (requires doctor role)
- `/patient` - Patient portal (requires patient role)

### Authentication Flow

```
1. User visits /auth/login or /auth/signup
2. User enters credentials
3. API validates and creates JWT token
4. Token stored in httpOnly cookie
5. User redirected to their role-specific dashboard
6. Middleware verifies token on protected routes
7. User can logout to clear session
```

## Demo Users

Pre-populated accounts for testing:

### Doctor Accounts
```
Email: dr.rajesh@clinsight.com
Password: password123
Name: Dr. Rajesh Kumar

Email: dr.priya@clinsight.com
Password: password123
Name: Dr. Priya Sharma
```

### Patient Account
```
Email: patient@clinsight.com
Password: password123
Name: John Doe
```

## File Structure

```
/app
  /auth
    /login
      page.tsx           - Login page UI
    /signup
      page.tsx           - Signup page UI
  /api/auth
    /signup/route.ts     - Signup API endpoint
    /login/route.ts      - Login API endpoint
    /logout/route.ts     - Logout API endpoint
    /me/route.ts         - Get current user endpoint
  /doctor
    page.tsx             - Doctor dashboard with logout button
  /patient
    page.tsx             - Patient portal with logout button
  layout.tsx             - Updated with auth providers
  middleware.ts          - Route protection middleware
  page.tsx               - Home page with auth redirect

/lib
  auth.ts                - Authentication utilities (hash, token, user store)
  useAuth.ts             - Client-side auth hook
  syntheticData.ts       - Patient data (unchanged)
  drugInteractions.ts    - Drug data (unchanged)

/components
  /doctor
    PreConsultationBrief.tsx  - (unchanged)
    PatientSearch.tsx         - (unchanged)
```

## Usage

### Login Page

Located at `/auth/login`

- Email and password fields
- Remembers last entered email
- Links to signup page
- Demo credentials displayed
- Redirects to appropriate dashboard on successful login

### Signup Page

Located at `/auth/signup`

- Full name field
- Email field
- Password and confirm password fields
- Role selection: Doctor or Patient
- Validation for password length (minimum 6 characters)
- Confirmation that passwords match
- Links to login page

### Client-Side Auth Hook

Use the `useAuth` hook in client components:

```typescript
import { useAuth } from '@/lib/useAuth';

export default function MyComponent() {
  const { user, loading, error, login, signup, logout, isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <p>Welcome, {user?.name}</p>}
      <button onClick={logout}>Logout</button>
    </>
  );
}
```

### Protecting Routes

Routes are automatically protected by middleware:

```typescript
// middleware.ts
const protectedRoutes = ['/doctor', '/patient'];
// Protected routes automatically check for valid JWT token
// If no token or invalid token, redirects to /auth/login
```

Role-based access control is enforced:

```typescript
// Doctor trying to access /patient → redirects to /doctor
// Patient trying to access /doctor → redirects to /patient
```

## Security Features

1. **Password Hashing**
   - Bcryptjs with 10 salt rounds
   - Passwords never stored in plain text

2. **JWT Token**
   - Signed with JWT_SECRET
   - Expires in 7 days
   - Verified on every protected request

3. **HttpOnly Cookies**
   - Token stored in httpOnly cookie (not accessible via JavaScript)
   - Prevents XSS attacks
   - Secure flag enabled in production
   - SameSite=Lax to prevent CSRF

4. **Input Validation**
   - Email format validation
   - Password length validation (min 6 characters)
   - Role validation (doctor or patient only)
   - Email uniqueness check on signup

5. **Middleware Protection**
   - All protected routes checked before rendering
   - Unauthorized access redirects to login
   - Invalid tokens trigger re-authentication

## Environment Variables

```env
# Required for production
JWT_SECRET=your-secure-secret-key-here

# Optional (uses defaults if not set)
NODE_ENV=development|production
```

Generate a secure JWT secret:

```bash
openssl rand -base64 32
```

## Installation & Setup

The authentication system is already integrated into the project. No additional setup required!

### Adding a New User Programmatically

```typescript
import { createUser } from '@/lib/auth';

const newUser = await createUser(
  'doctor@example.com',
  'password123',
  'Dr. Example',
  'doctor'
);
```

## Testing the Auth System

### Test Login Flow

1. Navigate to http://localhost:3000
2. Click "Login" button
3. Enter: `dr.rajesh@clinsight.com` / `password123`
4. Should redirect to `/doctor` (doctor dashboard)

### Test Signup Flow

1. Navigate to http://localhost:3000/auth/signup
2. Select "Patient" role
3. Fill in details:
   - Name: Jane Doe
   - Email: jane@example.com
   - Password: password123
4. Click "Create Account"
5. Should redirect to login page
6. Login with new credentials
7. Should redirect to `/patient` (patient portal)

### Test Protected Routes

1. Open http://localhost:3000/doctor without logging in
2. Should redirect to `/auth/login`

### Test Logout

1. Login as doctor
2. Click logout button (top right)
3. Should redirect to `/auth/login`

### Test Role-Based Access

1. Login as doctor
2. Try to navigate to `/patient`
3. Should redirect back to `/doctor` (you're a doctor)

## Database Integration (Future)

To replace the in-memory user store with a database:

1. Update `lib/auth.ts`:
   - Replace `userStore` Map with database queries
   - Update `findUserByEmail()` to use database
   - Update `createUser()` to use database insert
   - Update `findUserById()` to use database query

2. Example with Neon/PostgreSQL:

```typescript
import { sql } from '@vercel/postgres';

export async function findUserByEmail(email: string) {
  const result = await sql`SELECT * FROM users WHERE email = ${email}`;
  return result.rows[0];
}

export async function createUser(...) {
  const result = await sql`
    INSERT INTO users (id, email, passwordHash, name, role)
    VALUES (${id}, ${email}, ${hash}, ${name}, ${role})
    RETURNING *
  `;
  return result.rows[0];
}
```

## Troubleshooting

### "Email already registered" Error
- Email is already in use
- Use a different email or login instead

### "Invalid email or password" Error
- Email and password combination not found
- Check spelling of email and password
- Use demo credentials to test

### Protected route redirects to login infinitely
- JWT token may be invalid or expired
- Clear cookies and login again
- Check JWT_SECRET is set correctly

### CORS or cookie issues in production
- Ensure secure flag and domain are correctly set
- Check NODE_ENV is set to "production"
- Verify JWT_SECRET is set

## Next Steps

1. **Database Integration**: Connect to Neon PostgreSQL for persistent user storage
2. **Email Verification**: Add email confirmation on signup
3. **Password Reset**: Implement forgot password flow
4. **OAuth Integration**: Add Google/GitHub sign-in
5. **MFA**: Add two-factor authentication
6. **Session Expiry**: Auto-logout after inactivity
7. **Audit Logging**: Log all auth events

## API Reference

### POST /api/auth/signup

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "doctor" | "patient"
}
```

**Response:**
```json
{
  "message": "Signup successful",
  "user": {
    "id": "doctor-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "doctor"
  }
}
```

**Status Codes:**
- 201: Signup successful
- 400: Validation error or email already registered
- 500: Server error

### POST /api/auth/login

Authenticate user and create session.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "doctor-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "doctor"
  }
}
```

**Status Codes:**
- 200: Login successful
- 400: Missing fields
- 401: Invalid credentials
- 500: Server error

### POST /api/auth/logout

Clear session and logout user.

**Response:**
```json
{
  "message": "Logout successful"
}
```

### GET /api/auth/me

Get current authenticated user.

**Response:**
```json
{
  "user": {
    "id": "doctor-123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "doctor"
  }
}
```

**Status Codes:**
- 200: Success
- 401: Not authenticated
- 404: User not found
- 500: Server error

## Support

For issues or questions, check the main README.md or contact the development team.
