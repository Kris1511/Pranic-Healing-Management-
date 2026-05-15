# Setup Guide - Sanctuary Manager

This guide will help you set up the Sanctuary Manager project from scratch.

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- Git
- Code Editor (VS Code recommended)

## Initial Setup

### 1. Install Dependencies

```bash
cd phms
npm install
```

This will install all required packages including:
- Ionic React components
- React Query for state management
- Zustand for global state
- React Hook Form for forms
- Yup for validation
- Firebase SDK
- And more...

### 2. Environment Configuration

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API Configuration - Update with your backend URL
VITE_API_BASE_URL=http://localhost:3000/api

# Firebase Configuration - Get these from Firebase Console
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# App Settings
VITE_APP_ENV=development
VITE_APP_DEBUG=true
VITE_ENABLE_FCM=true
```

### 3. Firebase Setup (Optional)

If you're using Firebase Authentication and FCM:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing one
3. Enable Authentication (Email/Password)
4. Create web app and get config
5. Add your config to `.env.local`

### 4. Backend API Setup

The app expects a backend API at `VITE_API_BASE_URL`. The API should have endpoints:

```
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
GET    /api/auth/me                 - Get current user
POST   /api/auth/refresh            - Refresh token
POST   /api/auth/forgot-password    - Request password reset
POST   /api/auth/reset-password     - Reset password
POST   /api/auth/register           - Register new user
```

## Running the Application

### Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Testing

### Unit Tests

```bash
npm run test.unit
```

### E2E Tests (Cypress)

```bash
npm run test.e2e
```

## Project Structure Overview

```
src/
├── api/                     # API client layer
│   └── auth.api.ts         # Login, logout, password reset
├── components/             # React components
│   ├── common/            # Reusable UI components
│   │   ├── AppButton
│   │   ├── AppInput
│   │   ├── AppCard
│   │   └── ...
│   └── modules/           # Feature-specific components
├── constants/             # App constants
│   ├── queryKeys.constant.ts  # React Query keys
│   ├── roles.constant.ts      # User roles
│   └── routes.constant.ts     # Route definitions
├── guards/                # Route protection
│   ├── AuthGuard.tsx     # Authentication guard
│   └── RoleGuard.tsx     # Role-based guard
├── hooks/                 # Custom hooks
│   └── useAuth.ts        # Auth hook
├── pages/                 # Page components
│   ├── auth/
│   │   └── LoginPage.tsx
│   ├── super-admin/
│   ├── branch-admin/
│   ├── healer/
│   └── patient/
├── providers/            # Context providers
│   └── AppProviders.tsx  # React Query provider
├── store/               # Zustand stores
│   └── auth.store.ts   # Auth state
├── types/              # TypeScript types
├── utils/              # Utility functions
└── theme/              # CSS theme
```

## Key Features Setup

### 1. Authentication

The login page includes:
- Role selection (Super Admin, Branch Admin, Healer, Patient)
- Email/password input with validation
- "Forgot Password" link
- "Sign Up" link

**Files:**
- `src/pages/auth/LoginPage.tsx` - Login UI
- `src/hooks/useAuth.ts` - Auth logic
- `src/store/auth.store.ts` - Auth state
- `src/api/auth.api.ts` - Auth API calls

### 2. Form Handling

All forms use **React Hook Form + Yup** for validation:

```typescript
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email().required('Email required'),
  password: yup.string().min(6).required(),
});

const { control, handleSubmit } = useForm({ resolver: yupResolver(schema) });
```

### 3. State Management

**Zustand for Auth:**
```typescript
import { useAuthStore } from 'src/store/auth.store';

const { user, token, role, isAuthenticated, logout } = useAuthStore();
```

**React Query for Server State:**
```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/constants/queryKeys.constant';

const { data, isLoading } = useQuery({
  queryKey: queryKeys.patients.list(1, 10),
  queryFn: () => patientAPI.getPatients(1, 10),
});
```

### 4. Route Protection

**Protect routes with AuthGuard:**
```typescript
import AuthGuard from 'src/guards/AuthGuard';

<AuthGuard component={Dashboard} path="/dashboard" exact />
```

**Protect by role with RoleGuard:**
```typescript
import RoleGuard from 'src/guards/RoleGuard';

<RoleGuard
  component={AdminPanel}
  path="/admin"
  allowedRoles={['SUPER_ADMIN']}
/>
```

## Common Tasks

### Add a New API Endpoint

1. Create file in `src/api/feature.api.ts`
2. Use `axiosInstance` from `src/api/axois.instance.ts`
3. Add query keys in `src/constants/queryKeys.constant.ts`
4. Create API hook in `src/hooks/`

### Add a New Page

1. Create folder in `src/pages/feature/`
2. Create page component `src/pages/feature/FeaturePage.tsx`
3. Add route in App.tsx with AuthGuard/RoleGuard
4. Create styling `src/pages/feature/FeaturePage.css`

### Add a New Component

1. Create component in `src/components/common/` or `src/components/modules/`
2. Create CSS file for styling
3. Export from component file
4. Import and use in pages

### Add Form Validation

Use **Yup** for validation schemas:

```typescript
import * as yup from 'yup';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required(),
  phone: yup.string().matches(/^[\d\-\+]+$/, 'Invalid phone'),
});
```

## Styling

The app uses:
- **CSS files** for component styling
- **Ionic CSS utilities** for layout
- **CSS variables** in `src/theme/variables.css`

Primary color: `#1f7a6a` (Sanctuary green)

## Debugging

### Enable Debug Mode

Edit `.env.local`:
```env
VITE_APP_DEBUG=true
```

### React Query Devtools

Open `/` then look for React Query Devtools in bottom-right (dev mode only)

### Browser DevTools

- Check Network tab for API calls
- Check Console for errors
- Check Application > LocalStorage for stored auth

## Troubleshooting

### Issue: "Cannot find module"

Solution:
```bash
rm -rf node_modules
npm install
```

### Issue: Port 5173 already in use

Solution:
```bash
npm run dev -- --port 3000
```

### Issue: API calls returning 401

Solution:
- Check if token is being sent in headers
- Verify token is stored in Zustand store
- Check if backend is running
- Verify `VITE_API_BASE_URL` in `.env.local`

### Issue: Form validation not working

Solution:
- Verify Yup schema is correct
- Check field names match schema
- Ensure react-hook-form Controller is properly configured

## Next Steps

1. Implement additional pages (Dashboard, Patient List, etc.)
2. Set up backend API endpoints
3. Add more API modules for each feature
4. Create feature-specific pages and components
5. Add Firebase Authentication
6. Set up FCM for push notifications
7. Create Admin dashboard
8. Add patient appointment system
9. Implement payment processing
10. Add reporting features

## Resources

- [Ionic Documentation](https://ionicframework.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [React Query Documentation](https://tanstack.com/query/latest)
- [React Hook Form Documentation](https://react-hook-form.com)
- [Yup Documentation](https://github.com/jquense/yup)

## Support

For questions or issues:
1. Check the README.md for architecture overview
2. Review component examples in `/src/components/common/`
3. Check existing implementations for patterns
4. Review API documentation
5. Contact the development team

---

**Happy Coding! 🚀**
