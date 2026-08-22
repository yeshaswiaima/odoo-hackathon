import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('dayflow_user') || sessionStorage.getItem('dayflow_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('dayflow_token') || sessionStorage.getItem('dayflow_token') || null;
  });
  const [isLoading, setIsLoading] = useState(true);

  // Validate session on mount
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('dayflow_user', JSON.stringify(res.user));
          }
        } catch (err) {
          console.error('Session validation failed:', err);
          logout();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (email, password, rememberMe = true) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);

      if (rememberMe) {
        localStorage.setItem('dayflow_token', res.token);
        localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      } else {
        sessionStorage.setItem('dayflow_token', res.token);
        sessionStorage.setItem('dayflow_user', JSON.stringify(res.user));
      }
      return res.user;
    }
    throw new Error(res.message || 'Failed to authenticate.');
  };

  const register = async (userData, rememberMe = true) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.token) {
      setToken(res.token);
      setUser(res.user);

      if (rememberMe) {
        localStorage.setItem('dayflow_token', res.token);
        localStorage.setItem('dayflow_user', JSON.stringify(res.user));
      } else {
        sessionStorage.setItem('dayflow_token', res.token);
        sessionStorage.setItem('dayflow_user', JSON.stringify(res.user));
      }
      return res.user;
    }
    throw new Error(res.message || 'Registration failed.');
  };

  const logout = () => {
    try {
      if (token) {
        api.post('/auth/logout', {}).catch(() => {});
      }
    } catch {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('dayflow_token');
    sessionStorage.removeItem('dayflow_token');
    localStorage.removeItem('dayflow_user');
    sessionStorage.removeItem('dayflow_user');
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => {
      const updated = { ...prev, ...updatedFields };
      localStorage.setItem('dayflow_user', JSON.stringify(updated));
      return updated;
    });
  };

  const isAdmin = user?.role === 'admin' || user?.role === 'hr' || user?.role === 'hr_officer';
  const isEmployee = user?.role === 'employee';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isAdmin,
        isEmployee,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
