import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/api.types';
import { ROUTES } from '../constants/routes.constant';

interface RoleGuardProps {
  component: React.ComponentType<any>;
  path: string;
  allowedRoles: UserRole[];
  exact?: boolean;
}

/**
 * RoleGuard Component
 * Protects routes that require specific user roles
 * Redirects to unauthorized page if user doesn't have required role
 */
const RoleGuard: React.FC<RoleGuardProps> = ({
  component: Component,
  allowedRoles,
  ...rest
}) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  const hasRequiredRole = role && allowedRoles.includes(role);

  return (
    <Route
      {...rest}
      render={(props) =>
        hasRequiredRole ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: ROUTES.COMMON.UNAUTHORIZED,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default RoleGuard;
