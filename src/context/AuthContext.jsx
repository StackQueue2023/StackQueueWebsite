import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext();

export function getRoleDashboard(role) {
  if (role === 'admin') return '/admin/dashboard';
  if (role === 'tutor' || role === 'trainer') return '/tutor/dashboard';
  return '/student/dashboard';
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    return localStorage.getItem('cq_token') || null;
  });

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('cq_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      return null;
    }
  });

  const [profile, setProfile] = useState(() => {
    try {
      const savedProfile = localStorage.getItem('cq_profile');
      return savedProfile ? JSON.parse(savedProfile) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // Helper to clear state and local storage on logout/auth failure
  const performLogoutState = () => {
    try {
      localStorage.removeItem('cq_token');
      localStorage.removeItem('cq_user');
      localStorage.removeItem('cq_profile');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cq_') || key.toLowerCase().includes('project') || key.toLowerCase().includes('student')) {
          localStorage.removeItem(key);
        }
      });
      sessionStorage.clear();
    } catch (e) {
      console.error('Storage clear error:', e);
    }
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  // Cross-tab and window broadcast listener for logout & real-time XP sync
  useEffect(() => {
    const handleLogoutEvent = () => {
      performLogoutState();
    };
    const handleStorageSync = (e) => {
      if (e.key === 'cq_profile' && e.newValue) {
        try {
          setProfile(JSON.parse(e.newValue));
        } catch (_) {}
      } else if (e.key === 'cq_token' && !e.newValue) {
        performLogoutState();
      }
    };
    window.addEventListener('auth-logout', handleLogoutEvent);
    window.addEventListener('storage', handleStorageSync);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
      window.removeEventListener('storage', handleStorageSync);
    };
  }, []);

  // Helper to persist session into localStorage (ensuring passwords are never saved)
  const saveAuthSession = (authToken, authUser, authProfile) => {
    if (authToken) {
      localStorage.setItem('cq_token', authToken);
      setToken(authToken);
    }
    if (authUser) {
      const safeUser = { ...authUser };
      delete safeUser.password;
      localStorage.setItem('cq_user', JSON.stringify(safeUser));
      setUser(safeUser);
    }
    if (authProfile) {
      localStorage.setItem('cq_profile', JSON.stringify(authProfile));
      setProfile(authProfile);
    }
  };

  // Validate session with backend on startup
  useEffect(() => {
    let isMounted = true;
    async function validateSession() {
      const savedToken = localStorage.getItem('cq_token');
      if (savedToken) {
        try {
          const res = await api.get('/auth/me');
          if (isMounted) {
            if (res.data?.success) {
              saveAuthSession(savedToken, res.data.user, res.data.profile);
            } else {
              performLogoutState();
            }
          }
        } catch (err) {
          console.error('Session validation error:', err);
          if (isMounted && err.response && err.response.status === 401) {
            performLogoutState();
          }
        }
      } else {
        if (isMounted) {
          performLogoutState();
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    validateSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (identifier, password) => {
    const res = await api.post('/auth/login', { identifier, password });
    if (res.data?.success) {
      saveAuthSession(res.data.token, res.data.user, res.data.profile);
      return res.data;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const register = async (data) => {
    const res = await api.post('/auth/register', data);
    if (res.data?.success) {
      saveAuthSession(res.data.token, res.data.user, res.data.profile);
      return res.data;
    }
    throw new Error(res.data?.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout').catch(() => {});
    } catch (_) {}
    performLogoutState();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
  };

  const quickDemoSwitch = async (role) => {
    try {
      const res = await api.post('/auth/demo-switch', { role });
      if (res.data?.success) {
        saveAuthSession(res.data.token, res.data.user, res.data.profile);
        return res.data;
      }
    } catch (err) {
      console.error('Demo switch error:', err);
      throw err;
    }
  };

  // Immediately synchronize XP balance from a verified backend submission response
  const applyXpUpdate = ({ totalXp, xpAwarded = 0, xpEarned = 0, level = null, feature = '' } = {}) => {
    const awarded = Number(xpAwarded || xpEarned || 0);
    let computedTotal = null;

    setProfile((prev) => {
      const prevXp = Number(prev?.totalXp ?? 0);
      computedTotal = typeof totalXp === 'number' && !Number.isNaN(totalXp)
        ? totalXp
        : prevXp + Math.max(0, awarded);

      const nextProfile = {
        ...(prev || {}),
        totalXp: computedTotal,
        ...(level ? { currentLevel: level } : {})
      };
      try {
        localStorage.setItem('cq_profile', JSON.stringify(nextProfile));
      } catch (_) {}
      return nextProfile;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sq-xp-updated', {
        detail: {
          totalXp: computedTotal,
          xpAwarded: awarded,
          level,
          feature,
          timestamp: Date.now()
        }
      }));
    }
  };

  const refreshProfile = async () => {
    try {
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        saveAuthSession(localStorage.getItem('cq_token'), res.data.user, res.data.profile);
      }
    } catch (err) {
      console.error('Refresh profile error:', err);
    }
  };

  const isStudent = user?.role === 'student';
  const isTutor = user?.role === 'tutor' || user?.role === 'trainer';
  const isTrainer = isTutor;
  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      token,
      loading,
      login,
      register,
      logout,
      quickDemoSwitch,
      refreshProfile,
      applyXpUpdate,
      getRoleDashboard,
      isStudent,
      isTutor,
      isTrainer,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
