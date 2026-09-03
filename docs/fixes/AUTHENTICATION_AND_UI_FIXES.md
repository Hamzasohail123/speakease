# Authentication and UI Fixes Documentation

## Overview
This document outlines the issues identified and the proposed fixes for authentication routing, history display, password visibility, nodemailer setup for email verification, and email verification on signup.

---

## Issue 1: Authentication Route Protection

### Problem
Currently, when a user is logged in, they can still access the login and register pages. This creates a poor user experience and potential security concerns. Users should be redirected to the dashboard if they try to access auth pages while authenticated.

### Current Behavior
- Users can navigate to `/login` and `/register` even when logged in
- No protection exists in the auth layout or pages
- Users are redirected to login only when accessing protected routes, not the reverse

### Proposed Solution

#### Frontend Changes

1. **Create `PublicRoute` Component** (`frontend/src/components/auth/public-route.tsx`)
   - Similar to `ProtectedRoute` but redirects authenticated users away from auth pages
   - Redirects to `/dashboard` if user is already authenticated
   - Allows unauthenticated users to access login/register pages

2. **Update Auth Layout** (`frontend/src/app/(auth)/layout.tsx`)
   - Wrap children with `PublicRoute` component
   - This will protect all routes under `(auth)` group

3. **Update Login Page** (`frontend/src/app/(auth)/login/page.tsx`)
   - Add client-side check using `useAuth` hook
   - Redirect if already authenticated (as backup)

4. **Update Register Page** (`frontend/src/app/(auth)/register/page.tsx`)
   - Add client-side check using `useAuth` hook
   - Redirect if already authenticated (as backup)

### Implementation Details
- Use `useAuthStore` to check authentication state
- Use Next.js `useRouter` for navigation
- Handle loading states to prevent flash of content
- Ensure redirect happens before page renders

---

## Issue 2: History Display - Show All Sessions

### Problem
The history page currently shows only the last 50 sessions (hardcoded limit). Users want to see all their practice history, not just a limited subset.

### Current Implementation
- **Frontend**: `frontend/src/app/(dashboard)/history/page.tsx` calls `sessionsApi.getHistory(50, 0)`
- **Backend**: `backend/src/modules/sessions/controllers/sessionController.ts` accepts `limit` and `offset` query params (defaults to 20)
- **Service**: `getUserSessionHistory` accepts limit and offset parameters

### Proposed Solution

#### Option A: Fetch All Sessions (Recommended for small datasets)
- Remove limit parameter or set a very high limit
- Fetch all sessions in a single request
- Display all sessions with proper pagination or infinite scroll on frontend

#### Option B: Implement Pagination (Recommended for large datasets)
- Add pagination controls to the history page
- Implement "Load More" button or infinite scroll
- Fetch sessions in batches (e.g., 20-50 at a time)
- Show total count of sessions

### Implementation Details

**Frontend Changes:**
1. **Update History Page** (`frontend/src/app/(dashboard)/history/page.tsx`)
   - Remove hardcoded limit or implement pagination
   - Add "Load More" button or infinite scroll
   - Display total session count

2. **Update Sessions API** (`frontend/src/lib/api/sessions.ts`)
   - Modify `getHistory` to support pagination
   - Add method to get total count if needed

**Backend Changes:**
1. **Update Session Controller** (`backend/src/modules/sessions/controllers/sessionController.ts`)
   - Return total count along with sessions
   - Support pagination parameters

2. **Update Session Service** (`backend/src/modules/sessions/services/sessionService.ts`)
   - Add method to get total session count
   - Ensure efficient querying for large datasets

3. **Update Session Repository** (`backend/src/modules/sessions/repositories/sessionRepository.ts`)
   - Add count query for total sessions
   - Optimize queries with proper indexing

### Recommended Approach
For initial implementation, **Option A** (fetch all) is simpler and sufficient for most users. If the dataset grows large, migrate to **Option B** (pagination).

---

## Issue 3: Password Visibility Toggle (Eye Icon)

### Problem
Password and confirm password fields in login and register forms don't have eye icons to toggle visibility. Users should be able to see what they're typing.

### Current Implementation
- **Login Form**: `frontend/src/components/forms/login-form.tsx` - password field is type="password"
- **Register Form**: `frontend/src/components/forms/register-form.tsx` - password field is type="password" (no confirm password field currently - needs to be added)

### Proposed Solution

#### Frontend Changes

1. **Create Password Input Component** (`frontend/src/components/ui/password-input.tsx`)
   - Reusable component with eye icon toggle
   - Uses lucide-react `Eye` and `EyeOff` icons
   - Maintains all Input component styling and props
   - Toggles between `type="password"` and `type="text"`

2. **Update Login Form** (`frontend/src/components/forms/login-form.tsx`)
   - Replace password `Input` with `PasswordInput` component
   - Add eye icon toggle functionality

3. **Update Register Form** (`frontend/src/components/forms/register-form.tsx`)
   - Replace password `Input` with `PasswordInput` component
   - **Add confirm password field** (currently missing) with eye icon
   - Add validation to ensure passwords match
   - Update schema to include `confirmPassword` field
   - Add password mismatch error message

### Implementation Details
- Use React state to manage visibility (`useState`)
- Toggle icon between `Eye` and `EyeOff` based on state
- Position icon absolutely in the input field (right side)
- Ensure icon is clickable and accessible
- Maintain existing validation and styling

---

## Issue 4: Nodemailer Setup and Configuration for Email Verification

### Problem
Nodemailer is already installed and partially configured, but needs to be properly set up and used for sending email verification emails when users sign up. Currently, nodemailer is used for admin notifications and feedback, but not for user email verification.

### Current Status
- **Nodemailer is installed**: `backend/package.json` includes `"nodemailer": "7.0.12"`
- **Email configuration exists**: `backend/src/config/env.ts` has SMTP and Gmail configuration
- **Email services exist**: 
  - `backend/src/modules/auth/services/notificationService.ts` - sends admin notifications
  - `backend/src/modules/feedback/services/emailService.ts` - sends feedback emails
- **Email setup documentation**: `docs/setup/EMAIL_SETUP.md` exists
- **Missing**: Email verification service for user signup

### Current Email Configuration

The backend already has nodemailer configured with two options:

1. **SMTP Configuration** (via environment variables):
   - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `SMTP_FROM`

2. **Gmail Configuration** (via environment variables):
   - `GMAIL_USER`, `GMAIL_APP_PASSWORD`

Both configurations use a `createTransporter()` function pattern that:
- Checks for SMTP credentials first
- Falls back to Gmail if SMTP not configured
- Returns `null` if no email config exists (logs instead of sending)

### Proposed Solution

#### Backend Changes

1. **Create Shared Email Service Utility** (`backend/src/utils/emailService.ts`)
   - Extract the `createTransporter()` function to a shared utility
   - This will be used by both existing services and new verification service
   - Ensures consistent email configuration across the app

2. **Create Email Verification Service** (`backend/src/modules/auth/services/emailVerificationService.ts`)
   - Use the existing nodemailer configuration
   - Create function to send verification emails to users
   - Create professional HTML email template for verification
   - Include verification link with token
   - Handle email sending errors gracefully

3. **Verify Email Configuration**
   - Ensure environment variables are properly set
   - Test email sending functionality
   - Add validation to check if email is configured before registration

4. **Update Registration Flow** (`backend/src/modules/auth/services/authService.ts`)
   - Call email verification service after user creation
   - Send verification email instead of immediately logging in
   - Handle email sending failures appropriately

### Implementation Details

**Email Service Structure:**
- Reuse existing `createTransporter()` pattern from `notificationService.ts`
- Create verification email template with:
  - Professional HTML design matching app branding
  - Verification link/button
  - User's name personalization
  - Expiration notice
  - Support contact information

**Email Configuration Check:**
- Validate email configuration on server startup (optional)
- Show warning if email not configured
- Provide clear error messages if email sending fails

**Error Handling:**
- If email sending fails, log error but don't block user registration
- Provide fallback message to user
- Allow resending verification email

### Environment Variables (Already Configured)

The following environment variables should be set in `backend/.env`:

```env
# Option 1: Gmail (Simplest - Recommended)
GMAIL_USER=hamzasohail429@gmail.com
GMAIL_APP_PASSWORD=your_16_char_app_password

# Option 2: SMTP (More flexible)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hamzasohail429@gmail.com
SMTP_PASS=your_app_password
SMTP_SECURE=false
SMTP_FROM=hamzasohail429@gmail.com
```

### Testing Email Configuration

1. **Test Email Sending**:
   - Use existing test endpoint: `backend/scripts/test-email.ts`
   - Or use admin test endpoint if available
   - Verify emails are received correctly

2. **Verify Configuration**:
   - Check that environment variables are set
   - Test with both Gmail and SMTP configurations
   - Ensure emails are not going to spam

### Notes

- Nodemailer is already properly configured and working for other email services
- We just need to create the verification email service using the existing setup
- No additional nodemailer installation or configuration needed
- The email verification service will follow the same pattern as existing email services

---

## Issue 5: Email Verification on Signup

### Problem
When users sign up, they should receive a verification email to confirm their email address. Currently, users are immediately logged in after registration without email verification.

### Current Implementation
- **Registration**: `backend/src/modules/auth/services/authService.ts` - `registerUser` function
- **Email Service**: `backend/src/modules/auth/services/notificationService.ts` - sends admin notification
- **User Model**: `backend/prisma/schema.prisma` - no email verification fields

### Proposed Solution

#### Database Changes

1. **Update User Schema** (`backend/prisma/schema.prisma`)
   - Add `emailVerified Boolean @default(false)`
   - Add `emailVerificationToken String?`
   - Add `emailVerificationTokenExpiry DateTime?`

2. **Create Migration**
   - Generate Prisma migration for schema changes
   - Apply migration to database

#### Backend Changes

1. **Update Auth Service** (`backend/src/modules/auth/services/authService.ts`)
   - Modify `registerUser` to:
     - Generate email verification token
     - Set token expiry (e.g., 24 hours)
     - Set `emailVerified` to `false`
     - Send verification email instead of immediately logging in
     - Return user without tokens (user must verify email first)

2. **Create Email Verification Service** (`backend/src/modules/auth/services/emailVerificationService.ts`)
   - Function to generate verification token
   - Function to send verification email using existing nodemailer setup (see Issue 4)
   - Function to verify email token
   - Function to resend verification email
   - Use the same `createTransporter()` pattern as existing email services

3. **Create Verification Email Template**
   - HTML email template with verification link
   - Include user's name
   - Include expiration time
   - Professional design matching app branding

4. **Add Verification Endpoints** (`backend/src/modules/auth/controllers/authController.ts`)
   - POST `/api/v1/auth/verify-email` - Verify email with token
   - POST `/api/v1/auth/resend-verification` - Resend verification email
   - GET `/api/v1/auth/verify-email/:token` - Verify email via link (optional)

5. **Update Login** (`backend/src/modules/auth/services/authService.ts`)
   - Check if email is verified before allowing login
   - Return appropriate error if email not verified
   - Optionally allow login but restrict features until verified

6. **Update Auth Routes** (`backend/src/modules/auth/routes.ts`)
   - Add verification routes
   - Add resend verification route

#### Frontend Changes

1. **Update Register Form** (`frontend/src/components/forms/register-form.tsx`)
   - After successful registration, show message: "Please check your email to verify your account"
   - Don't automatically redirect to dashboard
   - Show "Resend verification email" button

2. **Create Email Verification Page** (`frontend/src/app/(auth)/verify-email/page.tsx`)
   - Page to handle email verification
   - Show success/error messages
   - Redirect to login after successful verification

3. **Update Login Form** (`frontend/src/components/forms/login-form.tsx`)
   - Show error if email not verified
   - Add link to resend verification email

4. **Create Verification Status Component** (`frontend/src/components/auth/verification-status.tsx`)
   - Show verification status in user profile
   - Allow resending verification email

### Implementation Details

**Verification Token:**
- Generate cryptographically secure random token (32+ characters)
- Store hashed version in database
- Include expiry time (24 hours default)
- Include in verification URL: `/verify-email?token=xxx`

**Email Template:**
- Subject: "Verify your SpeakEase account"
- Include user's name
- Include verification link/button
- Include expiration notice
- Include support contact if needed

**Security Considerations:**
- Tokens should be single-use
- Tokens should expire after reasonable time
- Rate limit verification attempts
- Rate limit resend requests
- Log verification attempts for security

**User Experience:**
- Clear messaging about email verification requirement
- Easy resend functionality
- Graceful handling of expired tokens
- Option to change email if needed

### Database Migration
```prisma
model User {
  // ... existing fields
  emailVerified              Boolean    @default(false)
  emailVerificationToken     String?
  emailVerificationTokenExpiry DateTime?
}
```

---

## Implementation Priority

1. **High Priority:**
   - Issue 1: Authentication Route Protection (security & UX)
   - Issue 3: Password Visibility Toggle (UX)

2. **Medium Priority:**
   - Issue 2: History Display (feature enhancement)
   - Issue 4: Nodemailer Setup for Email Verification (required for Issue 5)
   - Issue 5: Email Verification on Signup (security - depends on Issue 4)

---

## Testing Checklist

### Issue 1: Authentication Route Protection
- [ ] Logged-in user cannot access `/login`
- [ ] Logged-in user cannot access `/register`
- [ ] Logged-in user is redirected to `/dashboard` from auth pages
- [ ] Logged-out user can access auth pages normally
- [ ] No flash of content before redirect

### Issue 2: History Display
- [ ] All user sessions are displayed
- [ ] Sessions are ordered correctly (newest first)
- [ ] Performance is acceptable with many sessions
- [ ] Empty state shows when no sessions exist

### Issue 3: Password Visibility Toggle
- [ ] Eye icon appears in password fields
- [ ] Clicking icon toggles visibility
- [ ] Works in both login and register forms
- [ ] Confirm password field has eye icon
- [ ] Icon is accessible (keyboard navigation)

### Issue 4: Nodemailer Setup
- [ ] Email configuration is verified and working
- [ ] Shared email service utility is created
- [ ] Email verification service can send emails
- [ ] Verification emails are received correctly
- [ ] Email templates render properly
- [ ] Error handling works when email fails
- [ ] Both SMTP and Gmail configurations work

### Issue 5: Email Verification
- [ ] Verification email is sent on signup
- [ ] Email contains correct verification link
- [ ] Verification token works correctly
- [ ] Expired tokens are rejected
- [ ] Resend verification works
- [ ] Unverified users cannot login (or have restrictions)
- [ ] Verified users can login normally

---

## Notes

- All changes should maintain backward compatibility where possible
- Add proper error handling and user-friendly error messages
- Update API documentation if endpoints change
- Consider adding logging for security-related actions
- Test all changes thoroughly before deployment
- Update environment variables documentation

---

## Questions for Clarification

1. **History Display**: Should we implement pagination or fetch all sessions? 
Ans: fetc all on the basis of week but card design should be same and modern as now
2. **Email Verification**: Should unverified users be completely blocked from login, or just have limited access?
Ans: fully block
3. **Nodemailer Configuration**: Is the email configuration already set up in production/staging? Should we verify it before implementing?
Ans: yes
4. **Password Toggle**: Should the eye icon be visible by default or only on hover/focus?
Ans: should be visible by default.

---

**Document Created**: 2024-12-29
**Last Updated**: 2024-12-29 (Updated Issue 4: Changed from Multer to Nodemailer setup)

