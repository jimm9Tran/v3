import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['x-auth-token'] = token;
    } else {
      delete axios.defaults.headers.common['x-auth-token'];
    }
  }, [token]);

  // Load user on mount
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await axios.get('/api/auth/me');
          setUser(res.data.user);
        } catch (err) {
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token]);

  // Login
  const login = async (credentials) => {
    try {
      const res = await axios.post('/api/auth/login', credentials);
      const { token: newToken, user: userData } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      toast.success('Đăng nhập thành công!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng nhập thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await axios.post('/api/auth/register', userData);
      const { token: newToken, user: userInfo } = res.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userInfo);
      
      toast.success('Đăng ký thành công!');
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || 'Đăng ký thất bại';
      toast.error(message);
      return { success: false, message };
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    toast.success('Đăng xuất thành công!');
  };

  // Update user
  const updateUser = (userData) => {
    setUser(userData);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isStaff: user?.role === 'staff',
    isCustomer: user?.role === 'customer'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 