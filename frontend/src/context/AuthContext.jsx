import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('grand_archive_token') || null);
  const [loading, setLoading] = useState(true);

  // Fetch current user on mount or token change
  const fetchCurrentUser = async () => {
    try {
      const storedToken = localStorage.getItem('grand_archive_token');
      if (!storedToken) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.user);
      } else {
        setUser(null);
        localStorage.removeItem('grand_archive_token');
      }
    } catch (err) {
      console.warn('Could not re-authenticate session:', err.message);
      setUser(null);
      localStorage.removeItem('grand_archive_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [token]);

  // Handle standard registration
  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('grand_archive_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Handle standard login
  const login = async (credential, password) => {
    const res = await api.post('/auth/login', { credential, password });
    if (res.data.success) {
      localStorage.setItem('grand_archive_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // 1-Click Demo Login
  const demoLogin = async (role = 'reader') => {
    const res = await api.post('/auth/demo-login', { role });
    if (res.data.success) {
      localStorage.setItem('grand_archive_token', res.data.token);
      setToken(res.data.token);
      setUser(res.data.user);
    }
    return res.data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // Continue anyway
    }
    localStorage.removeItem('grand_archive_token');
    setToken(null);
    setUser(null);
  };

  // Update Reading Shelf
  const updateShelf = async (bookId, status, progressPage = 0) => {
    const res = await api.post('/users/shelf', { bookId, status, progressPage });
    if (res.data.success) {
      setUser((prev) => ({
        ...prev,
        readingShelf: res.data.readingShelf
      }));
    }
    return res.data;
  };

  // Remove from Reading Shelf
  const removeFromShelf = async (bookId) => {
    const res = await api.delete(`/users/shelf/${bookId}`);
    if (res.data.success) {
      setUser((prev) => ({
        ...prev,
        readingShelf: res.data.readingShelf
      }));
    }
    return res.data;
  };

  const isAuthor = user?.role === 'author';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthor,
        register,
        login,
        demoLogin,
        logout,
        refreshUser: fetchCurrentUser,
        updateShelf,
        removeFromShelf,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
