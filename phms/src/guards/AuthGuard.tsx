import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROUTES } from '../constants/routes.constant';

interface PrivateRouteProps {
  component: React.ComponentType<any>;
  path: string;
  exact?: boolean;
}

/**
 * AuthGuard Component
 * Protects routes that require authentication
 * Redirects to login page if user is not authenticated
 */
const AuthGuard: React.FC<PrivateRouteProps> = ({ component: Component, ...rest }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: ROUTES.AUTH.LOGIN,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
};

export default AuthGuard;
