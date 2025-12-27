import { createContext, useContext, useState, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setIsLoading(true);
    try {
      const response = await authAPI.login({ email, password });
      const { token, user: userData } = response.data?.data || response.data;

      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('authToken', token);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    setIsLoading(true);
    try {
      const response = await authAPI.register(userData);
      const { token, user: registeredUser } = response.data?.data || response.data;

      setUser(registeredUser);
      localStorage.setItem('user', JSON.stringify(registeredUser));
      localStorage.setItem('authToken', token);
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  }, []);

  const updateUser = useCallback((updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  }, [user]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
