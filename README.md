# Sanctuary Manager - Professional Healing Portal

A cross-platform healthcare management system built with Ionic React, featuring role-based access control for Super Admins, Branch Admins, Healers, and Patients.

## Tech Stack

- **Ionic Framework v8+**: Cross-platform UI framework for iOS, Android, and Web
- **React.js v19+**: UI framework
- **TypeScript v5+**: Type-safe development
- **Zustand v4+**: Lightweight global state management (auth user, role, branch)
- **React Query v5+**: Server state, API caching, background sync, loading states
- **React Hook Form v7+**: Form state and submission handling
- **Yup v1+**: Frontend schema validation
- **Axios v1+**: HTTP client with interceptors
- **React Router v6+**: Web and Ionic routing
- **Vite v5+**: Fast build tool
- **Day.js v1.11+**: Date formatting and manipulation
- **Firebase JS SDK v10+**: Firebase Auth and FCM token management

## Project Structure

```
src/
├── api/                    # API client layer
│   ├── axois.instance.ts  # Axios configuration with interceptors
│   ├── auth.api.ts        # Authentication API calls
│   ├── patient.api.ts     # Patient-related API calls
│   ├── healer.api.ts      # Healer-related API calls
│   └── ...                # Other API modules
├── components/            # React components
│   ├── common/           # Reusable UI components
│   │   ├── AppButton.tsx
│   │   ├── AppInput.tsx
│   │   ├── AppSelect.tsx
│   │   ├── AppCard.tsx
│   │   └── ...
│   └── modules/          # Feature-specific components
├── constants/            # Application constants
│   ├── queryKeys.constant.ts   # React Query key factory
│   ├── roles.constant.ts       # Role definitions and permissions
│   └── routes.constant.ts      # Route definitions
├── guards/              # Route guards
│   ├── AuthGuard.tsx   # Authentication guard
│   └── RoleGuard.tsx   # Role-based access control
├── hooks/              # Custom React hooks
│   ├── useAuth.ts     # Authentication hook
│   ├── useFetch.ts    # Data fetching hook
│   └── ...
├── pages/              # Page components
│   ├── auth/          # Authentication pages
│   │   └── LoginPage.tsx
│   ├── super-admin/   # Super admin pages
│   ├── branch-admin/  # Branch admin pages
│   ├── healer/        # Healer pages
│   └── patient/       # Patient pages
├── providers/         # Context providers
│   └── AppProviders.tsx  # React Query provider setup
├── store/            # Zustand stores
│   ├── auth.store.ts    # Authentication state
│   └── notification.store.ts
├── theme/            # Theming
│   └── variables.css
├── types/            # TypeScript types
│   ├── api.types.ts
│   ├── healer.types.ts
│   └── ...
└── utils/            # Utility functions
    ├── date.util.ts
    ├── format.util.ts
    └── storage.util.ts
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Update with your API base URL and Firebase credentials:

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_FIREBASE_API_KEY=your_key_here
# ... other Firebase credentials
```

### 3. Install Zustand Persistence Middleware

The Zustand store uses middleware for localStorage persistence:

```bash
npm install zustand
```

## Key Features

### 1. Authentication System

**Login Flow:**
- Role selection (Super Admin, Branch Admin, Healer, Patient)
- Email and password validation with Yup
- React Hook Form for form state management
- Zustand store for auth state persistence
- JWT token management with automatic refresh
- Axios interceptors for automatic token injection

**Auth Store (Zustand):**
```typescript
const { user, token, role, isAuthenticated, login, logout, clearError } = useAuth();
```

### 2. Role-Based Access Control

Four user roles with specific permissions:
- **Super Admin**: Full system access
- **Branch Admin**: Branch-level management
- **Healer**: Healthcare provider access
- **Patient**: Patient portal access

Use `RoleGuard` to protect routes:
```typescript
<RoleGuard component={AdminDashboard} path="/admin" allowedRoles={['SUPER_ADMIN']} />
```

### 3. API Integration

**Axios Instance with Interceptors:**
- Automatic token injection in request headers
- 401 error handling with logout redirect
- Configurable timeout and base URL

**API Modules:**
- Organized by feature (auth, patient, healer, etc.)
- Consistent error handling
- Type-safe responses with TypeScript

### 4. State Management

**Zustand Store:**
- Lightweight alternative to Redux
- Automatic localStorage persistence
- Auth state: user, token, role, branch, loading, error
- Type-safe with TypeScript

**React Query:**
- Server state management
- Automatic caching and background sync
- Loading and error states
- Query invalidation for mutations

### 5. Form Handling

**React Hook Form + Yup:**
- Controller-based form fields
- Real-time validation
- Error message display
- Password field with toggle visibility

### 6. UI Components

Reusable components using Ionic React:
- `AppButton`: Styled buttons with loading state
- `AppInput`: Form inputs with validation
- `AppSelect`: Select dropdowns
- `AppCard`: Card containers
- `AppTable`: Data tables
- `AppModal`: Modal dialogs
- `AppLoader`: Loading spinners
- And more...

## Usage Examples

### Login Page Example

```typescript
import { useAuth } from '../../hooks/useAuth';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import AppInput from '../../components/common/AppInput';

const LoginPage = () => {
  const { login, isLoggingIn, error } = useAuth();
  const { control, handleSubmit } = useForm({
    resolver: yupResolver(loginSchema),
  });

  const onSubmit = (data) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => <AppInput {...field} />}
      />
      <button type="submit" disabled={isLoggingIn}>
        Login
      </button>
    </form>
  );
};
```

### Protected Route Example

```typescript
import AuthGuard from './guards/AuthGuard';
import RoleGuard from './guards/RoleGuard';
import Dashboard from './pages/Dashboard';

<AuthGuard component={Dashboard} path="/dashboard" />
<RoleGuard 
  component={AdminPanel} 
  path="/admin" 
  allowedRoles={['SUPER_ADMIN', 'BRANCH_ADMIN']} 
/>
```

### Using React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../constants/queryKeys.constant';
import { patientAPI } from '../api/patient.api';

const PatientList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.patients.list(1, 10),
    queryFn: () => patientAPI.getPatients(1, 10),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data.map(patient => (
        <li key={patient.id}>{patient.firstName}</li>
      ))}
    </ul>
  );
};
```

## Development

### Start Development Server

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

### Run Tests

```bash
npm run test.unit
npm run test.e2e
```

### Lint Code

```bash
npm run lint
```

## Best Practices

1. **Type Safety**: Always define types for API responses and form data
2. **Error Handling**: Use consistent error messages and notifications
3. **Performance**: Leverage React Query caching and Zustand persistence
4. **Code Organization**: Keep components small and focused
5. **Form Validation**: Use Yup schemas for consistent validation
6. **Authentication**: Always validate tokens and handle expiration
7. **Accessibility**: Use semantic HTML and ARIA labels

## Troubleshooting

### Issue: Token not being sent to API

- Check Axios interceptor in `src/api/axois.instance.ts`
- Verify token is being stored in Zustand store
- Check Authorization header format (Bearer token)

### Issue: Routes not working

- Ensure routes are defined in `src/constants/routes.constant.ts`
- Check route paths match between Router and constants
- Verify AuthGuard/RoleGuard configuration

### Issue: Form validation not working

- Ensure Yup schema is properly defined
- Check form field names match schema properties
- Verify react-hook-form Controller binding

## License

Proprietary - All Rights Reserved

## Support

For issues or questions, please contact the development team.
