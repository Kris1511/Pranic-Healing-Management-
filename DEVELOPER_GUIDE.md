# Developer Quick Reference - Sanctuary Manager

A quick guide for common development tasks and patterns used in the Sanctuary Manager project.

## Table of Contents

1. [Authentication](#authentication)
2. [Forms](#forms)
3. [API Calls](#api-calls)
4. [State Management](#state-management)
5. [Components](#components)
6. [Routing](#routing)
7. [Styling](#styling)
8. [Utilities](#utilities)

---

## Authentication

### Get Current User

```typescript
import { useAuth } from 'src/hooks/useAuth';

const MyComponent = () => {
  const { user, isAuthenticated, role } = useAuth();

  if (!isAuthenticated) return <Redirect to="/auth/login" />;

  return <div>Welcome, {user?.firstName}</div>;
};
```

### Login User

```typescript
import { useAuth } from 'src/hooks/useAuth';
import { useHistory } from 'react-router-dom';

const LoginPage = () => {
  const { login, isLoggingIn, error } = useAuth();
  const history = useHistory();

  const handleLogin = (email, password, role) => {
    login(
      { email, password, role },
      {
        onSuccess: () => history.push('/dashboard'),
        onError: () => console.error(error),
      }
    );
  };

  return (
    <form onSubmit={() => handleLogin(...)}>
      {/* Form fields */}
    </form>
  );
};
```

### Logout

```typescript
const { logout } = useAuth();

<button onClick={logout}>Logout</button>;
```

### Check User Role

```typescript
const { role } = useAuth();

if (role === 'SUPER_ADMIN') {
  return <SuperAdminPanel />;
} else if (role === 'HEALER') {
  return <HealerPanel />;
}
```

---

## Forms

### Basic Form with Validation

```typescript
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import AppInput from 'src/components/common/AppInput';
import AppButton from 'src/components/common/AppButton';

// Define validation schema
const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email required'),
  password: yup.string().min(6, 'Min 6 chars').required('Password required'),
  phone: yup.string().matches(/^\d{10}$/, 'Invalid phone'),
});

type FormData = yup.InferType<typeof schema>;

const MyForm = () => {
  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <AppInput
            label="Email"
            type="email"
            {...field}
            onChange={(e) => field.onChange(e.detail.value)}
            error={errors.email?.message}
          />
        )}
      />

      <AppButton type="submit">Submit</AppButton>
    </form>
  );
};
```

### Conditional Validation

```typescript
const schema = yup.object().shape({
  accountType: yup.string().required(),
  businessName: yup.string().when('accountType', {
    is: 'business',
    then: (s) => s.required('Business name required'),
    otherwise: (s) => s.notRequired(),
  }),
});
```

### Dynamic Fields

```typescript
import { useFieldArray } from 'react-hook-form';

const MyForm = () => {
  const { control } = useForm();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'contacts',
  });

  return (
    <div>
      {fields.map((field, index) => (
        <div key={field.id}>
          <Controller
            name={`contacts.${index}.email`}
            control={control}
            render={({ field }) => <AppInput {...field} />}
          />
          <button onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button onClick={() => append({ email: '' })}>Add Contact</button>
    </div>
  );
};
```

---

## API Calls

### Using React Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from 'src/constants/queryKeys.constant';
import { patientAPI } from 'src/api/patient.api';

const PatientList = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.patients.list(1, 10),
    queryFn: () => patientAPI.getPatients(1, 10),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {data?.data.map((patient) => (
        <li key={patient.id}>{patient.firstName}</li>
      ))}
    </ul>
  );
};
```

### Using useFetch Hook

```typescript
import { useFetch } from 'src/hooks/useFetch';

const PatientDetail = ({ id }: { id: string }) => {
  const { data: patient, isLoading, error } = useFetch(
    `/patients/${id}`,
    {
      staleTime: 1000 * 60 * 5,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading patient</div>;

  return <div>{patient?.firstName} {patient?.lastName}</div>;
};
```

### Mutations (Create, Update, Delete)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from 'src/constants/queryKeys.constant';

const UpdatePatient = () => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationFn: (data) => patientAPI.updatePatient(data.id, data),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients.list(),
      });
    },
  });

  return (
    <button onClick={() => mutate({ id: 1, firstName: 'John' })} disabled={isPending}>
      {isPending ? 'Updating...' : 'Update'}
    </button>
  );
};
```

### Creating API Module

```typescript
// src/api/feature.api.ts
import axiosInstance from './axois.instance';
import { FeatureDTO } from '../types/api.types';

export const featureAPI = {
  getList: async (page = 1, limit = 10) => {
    const response = await axiosInstance.get(`/features?page=${page}&limit=${limit}`);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await axiosInstance.get(`/features/${id}`);
    return response.data;
  },

  create: async (data: FeatureDTO) => {
    const response = await axiosInstance.post('/features', data);
    return response.data;
  },

  update: async (id: string, data: FeatureDTO) => {
    const response = await axiosInstance.put(`/features/${id}`, data);
    return response.data;
  },

  delete: async (id: string) => {
    await axiosInstance.delete(`/features/${id}`);
  },
};
```

---

## State Management

### Zustand Store Usage

```typescript
import { useAuthStore } from 'src/store/auth.store';

const Dashboard = () => {
  const { user, logout } = useAuthStore();

  return (
    <div>
      <h1>Hello, {user?.firstName}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
};
```

### Creating a New Store

```typescript
// src/store/feature.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Feature {
  id: string;
  name: string;
}

interface FeatureStore {
  features: Feature[];
  selectedFeature: Feature | null;
  setFeatures: (features: Feature[]) => void;
  setSelectedFeature: (feature: Feature) => void;
}

export const useFeatureStore = create<FeatureStore>()(
  persist(
    (set) => ({
      features: [],
      selectedFeature: null,
      setFeatures: (features) => set({ features }),
      setSelectedFeature: (feature) => set({ selectedFeature: feature }),
    }),
    {
      name: 'feature-store',
    }
  )
);
```

---

## Components

### Creating a Common Component

```typescript
// src/components/common/AppAlert.tsx
import React from 'react';
import { IonAlert } from '@ionic/react';
import './AppAlert.css';

interface AppAlertProps {
  isOpen: boolean;
  title: string;
  message: string;
  onDismiss: () => void;
  buttons?: { text: string; handler?: () => void }[];
}

const AppAlert: React.FC<AppAlertProps> = ({
  isOpen,
  title,
  message,
  onDismiss,
  buttons = [{ text: 'OK', handler: onDismiss }],
}) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onDismiss}
      header={title}
      message={message}
      buttons={buttons}
      className="app-alert"
    />
  );
};

export default AppAlert;
```

### Using Components

```typescript
import AppAlert from 'src/components/common/AppAlert';

const MyPage = () => {
  const [alertOpen, setAlertOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setAlertOpen(true)}>Show Alert</button>

      <AppAlert
        isOpen={alertOpen}
        title="Confirmation"
        message="Are you sure?"
        onDismiss={() => setAlertOpen(false)}
        buttons={[
          {
            text: 'Cancel',
            handler: () => setAlertOpen(false),
          },
          {
            text: 'Confirm',
            handler: () => {
              console.log('Confirmed');
              setAlertOpen(false);
            },
          },
        ]}
      />
    </>
  );
};
```

---

## Routing

### Route with Authentication Guard

```typescript
import AuthGuard from 'src/guards/AuthGuard';
import RoleGuard from 'src/guards/RoleGuard';

const App = () => (
  <IonReactRouter>
    <Route path="/auth/login" component={LoginPage} exact />
    <AuthGuard component={Dashboard} path="/dashboard" />
    <RoleGuard
      component={AdminPanel}
      path="/admin"
      allowedRoles={['SUPER_ADMIN']}
    />
  </IonReactRouter>
);
```

### Programmatic Navigation

```typescript
import { useHistory } from 'react-router-dom';

const MyComponent = () => {
  const history = useHistory();

  const handleNavigate = () => {
    history.push('/dashboard');
  };

  return <button onClick={handleNavigate}>Go to Dashboard</button>;
};
```

### Getting Route Parameters

```typescript
import { useParams } from 'react-router-dom';

const PatientDetail = () => {
  const { id } = useParams<{ id: string }>();

  return <div>Patient ID: {id}</div>;
};
```

---

## Styling

### CSS Structure

```css
/* Component container */
.app-component {
  padding: 16px;
  border-radius: 8px;
  background: white;
}

/* Element inside component */
.app-component__title {
  font-size: 18px;
  font-weight: 600;
}

/* Modifier */
.app-component--active {
  border: 2px solid #1f7a6a;
}

/* Responsive */
@media (max-width: 768px) {
  .app-component {
    padding: 12px;
  }
}
```

### Using Ionic CSS Utilities

```typescript
<IonContent className="ion-padding">
  <div className="ion-text-center ion-margin-top">
    <h1 className="ion-text-uppercase">Title</h1>
    <p className="ion-color-medium">Subtitle</p>
  </div>
</IonContent>
```

---

## Utilities

### Date Utility

```typescript
import { dateUtil } from 'src/utils/date.util';

// Format date
dateUtil.format('2024-01-15', 'DD/MM/YYYY'); // 15/01/2024

// Get relative time
dateUtil.fromNow('2024-01-15'); // 2 days ago

// Check conditions
dateUtil.isToday('2024-01-15');
dateUtil.isPast('2024-01-15');
dateUtil.isFuture('2024-01-20');

// Date arithmetic
dateUtil.addDays('2024-01-15', 5);
dateUtil.diffInDays('2024-01-15', '2024-01-20'); // 5
```

### Format Utility

```typescript
import { formatUtil } from 'src/utils/format.util';

// Currency
formatUtil.currency(1000, 'USD'); // $1,000.00

// Phone
formatUtil.phone('1234567890'); // (123) 456-7890

// String manipulation
formatUtil.capitalize('hello'); // Hello
formatUtil.titleCase('hello world'); // Hello World
formatUtil.truncate('Long string', 10); // Long st...

// Number
formatUtil.number(1000000, 2); // 1,000,000.00
```

### Storage Utility

```typescript
import { storage } from 'src/utils/storage.util';

// Set
storage.set('user', { id: 1, name: 'John' });

// Get
const user = storage.get('user');

// Remove
storage.remove('user');

// Check exists
storage.has('user'); // true/false

// Clear all
storage.clear();
```

---

## Hooks Reference

### useAuth

```typescript
const {
  user,              // Current user data
  token,            // Auth token
  role,             // User role
  isAuthenticated,  // Is user logged in
  loading,          // Loading state
  error,            // Error message
  login,            // Login function
  logout,           // Logout function
  clearError,       // Clear error
} = useAuth();
```

### useToast

```typescript
const { show, success, error, warning, info } = useToast();

show('Message', { duration: 2000, color: 'primary' });
success('Success!');
error('Error!');
```

### useModal

```typescript
const { isOpen, open, close, toggle } = useModal();

<button onClick={open}>Open Modal</button>
<AppModal isOpen={isOpen} onDidDismiss={close} />
```

### usePagination

```typescript
const {
  page,
  limit,
  totalPages,
  nextPage,
  prevPage,
  goToPage,
  setPagination,
} = usePagination();

<AppPagination
  currentPage={page}
  totalPages={totalPages}
  onPageChange={goToPage}
/>
```

---

## Common Patterns

### Loading State Management

```typescript
const MyComponent = () => {
  const { data, isLoading } = useQuery({...});

  if (isLoading) return <AppLoader isLoading={true} />;

  return <div>{/* Content */}</div>;
};
```

### Error Handling

```typescript
const { data, error } = useQuery({...});

if (error) {
  return <AppEmptyState title="Error" message={error.message} />;
}
```

### Confirmation Dialog

```typescript
const { isOpen, open, close } = useModal();

<AppModal
  isOpen={isOpen}
  onDidDismiss={close}
  title="Confirm Delete"
  actions={[
    { label: 'Cancel', onClick: close },
    {
      label: 'Delete',
      onClick: () => {
        // Delete logic
        close();
      },
      variant: 'danger',
    },
  ]}
>
  Are you sure you want to delete this item?
</AppModal>
```

---

## Tips & Best Practices

1. **Always use TypeScript types** for props, state, and API responses
2. **Use React Query** for server state and Zustand for client state
3. **Create custom hooks** to abstract complex logic
4. **Use controller-based forms** with React Hook Form
5. **Centralize API calls** in API modules
6. **Use consistent error handling** across the app
7. **Keep components small and focused**
8. **Use CSS classes** with BEM naming convention
9. **Test forms** with different validation scenarios
10. **Document complex logic** with comments

---

Happy coding! 🚀
