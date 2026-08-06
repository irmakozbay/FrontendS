import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

const isValidToken = (value) =>
  Boolean(value && value !== 'null' && value !== 'undefined');

const createGuestSessionId = () =>
  `guest-${window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : Math.random().toString(36).substring(2, 11)
  }`;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem('token') || sessionStorage.getItem('token') || null
  );

  const [user, setUser] = useState(() => {
    try {
      const stored =
        localStorage.getItem('user') || sessionStorage.getItem('user');

      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState(() => {
    const storedToken =
      localStorage.getItem('token') || sessionStorage.getItem('token');

    if (isValidToken(storedToken)) {
      localStorage.removeItem('isGuest');
      sessionStorage.removeItem('isGuest');
      return false;
    }

    return (
      localStorage.getItem('isGuest') === 'true' ||
      sessionStorage.getItem('isGuest') === 'true'
    );
  });

  const isAuthenticated = isValidToken(token);
  const resolvedIsGuest = isGuest && !isAuthenticated;
  const userType = isAuthenticated
    ? 'authenticated'
    : resolvedIsGuest
      ? 'guest'
      : null;

  useEffect(() => {
    if (!isAuthenticated) return;

    localStorage.removeItem('isGuest');
    sessionStorage.removeItem('isGuest');
    localStorage.removeItem('guestToken');
    sessionStorage.removeItem('guestToken');
    localStorage.removeItem('temporaryGuestSession');
    sessionStorage.removeItem('temporaryGuestSession');

    setIsGuest(false);
  }, [isAuthenticated]);

  const login = async (userData, tokenValue, rememberMe = false) => {
    /*
     * Kullanıcı giriş yapmadan önce aktif misafir sohbetini koruyoruz.
     * ChatbotPage bu değeri okuyup aynı sessionId üzerinden geçmişi yükleyecek.
     *
     * guestSessionId burada hemen silinmemelidir. Aksi hâlde kullanıcı giriş
     * yaptıktan sonra eski misafir sohbetine tekrar ulaşılamaz.
     */
    const guestSessionId = sessionStorage.getItem('guestSessionId');

    if (guestSessionId) {
      sessionStorage.setItem('pendingGuestSessionId', guestSessionId);
    }

    localStorage.removeItem('isGuest');
    sessionStorage.removeItem('isGuest');
    localStorage.removeItem('guestToken');
    sessionStorage.removeItem('guestToken');
    localStorage.removeItem('temporaryGuestSession');
    sessionStorage.removeItem('temporaryGuestSession');
    localStorage.removeItem('accountRestricted');
    sessionStorage.removeItem('accountRestricted');

    // Önce eski kullanıcı kimlik bilgilerini iki depodan da temizle.
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');

    const storage = rememberMe ? localStorage : sessionStorage;

    if (isValidToken(tokenValue)) {
      storage.setItem('token', tokenValue);
      setToken(tokenValue);
    } else {
      setToken(null);
    }

    if (userData) {
      storage.setItem('user', JSON.stringify(userData));

      if (userData.email) {
        storage.setItem('userId', userData.email);
      }

      setUser(userData);
    } else {
      setUser(null);
    }

    setIsGuest(false);

    /*
     * Burada /api/chats/migrate isteği yapılmıyor.
     * Sohbet aktarımı frontend state/session senkronizasyonuyla yürütülüyor.
     * ChatbotPage pendingGuestSessionId değerini URL'deki sessionId'ye taşıyıp
     * mevcut geçmiş yükleme akışını çalıştırmalıdır.
     */
  };

  const continueAsGuest = () => {
    localStorage.setItem('isGuest', 'true');
    sessionStorage.setItem('isGuest', 'true');

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('pendingGuestSessionId');

    if (!sessionStorage.getItem('guestSessionId')) {
      sessionStorage.setItem('guestSessionId', createGuestSessionId());
    }

    setToken(null);
    setUser(null);
    setIsGuest(true);
  };

  const logout = async () => {
    const activeToken =
      token ||
      localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (isValidToken(activeToken)) {
      try {
        await api.post(
          '/api/auth/logout',
          {},
          {
            headers: {
              Authorization: `Bearer ${activeToken}`,
            },
          }
        );
      } catch (error) {
        console.warn('Logout event logging failed:', error);
      }
    }

    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
    localStorage.removeItem('userId');
    sessionStorage.removeItem('userId');
    localStorage.removeItem('isGuest');
    sessionStorage.removeItem('isGuest');
    localStorage.removeItem('guestToken');
    sessionStorage.removeItem('guestToken');
    localStorage.removeItem('temporaryGuestSession');
    sessionStorage.removeItem('temporaryGuestSession');
    sessionStorage.removeItem('guestSessionId');
    sessionStorage.removeItem('pendingGuestSessionId');

    setToken(null);
    setUser(null);
    setIsGuest(false);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        isGuest: resolvedIsGuest,
        isAuthenticated,
        userType,
        login,
        continueAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;