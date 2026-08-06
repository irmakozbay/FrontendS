import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8083',
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
  },
});

const isValidToken = (value) =>
  Boolean(
    value &&
    value !== 'null' &&
    value !== 'undefined' &&
    value.trim() !== ''
  );

const removeAuthorizationHeader = (headers) => {
  if (!headers) return;

  delete headers.Authorization;
  delete headers.authorization;

  if (typeof headers.delete === 'function') {
    headers.delete('Authorization');
    headers.delete('authorization');
  }
};

api.interceptors.request.use(
  (config) => {
    const url = config.url || '';

    const isPublicAuthEndpoint =
      (url.includes('/api/auth') && !url.includes('/api/auth/logout')) ||
      url.includes('/api/authenticationservice/login');

    const isAdminEndpoint =
      url.startsWith('/api/admin') ||
      url.includes('/api/admin/');

    const hasExplicitAuthorization =
      config.headers?.Authorization ||
      config.headers?.authorization ||
      (typeof config.headers?.get === 'function' &&
        config.headers.get('Authorization'));

    if (isPublicAuthEndpoint) {
      if (!hasExplicitAuthorization) {
        removeAuthorizationHeader(config.headers);
      }

      return config;
    }

    const token = isAdminEndpoint
      ? localStorage.getItem('adminToken')
      : localStorage.getItem('token') ||
      sessionStorage.getItem('token');

    if (isValidToken(token)) {
      config.headers.Authorization = `Bearer ${token.trim()}`;
    } else {
      removeAuthorizationHeader(config.headers);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const responseCode = error.response?.data?.code;
    const requestUrl = error.config?.url || '';

    if (
      status === 403 &&
      responseCode === 'ACCOUNT_RESTRICTED'
    ) {
      localStorage.setItem('accountRestricted', 'true');
      window.dispatchEvent(new Event('accountRestricted'));
    }

    if (status === 401) {
      const isGuestSession =
        localStorage.getItem('isGuest') === 'true' ||
        sessionStorage.getItem('isGuest') === 'true';

      const isAuthRequest =
        requestUrl.includes('/api/auth');

      const isAdminRequest =
        requestUrl.startsWith('/api/admin') ||
        requestUrl.includes('/api/admin/') ||
        window.location.pathname.startsWith('/admin');

      if (!isAuthRequest && !isGuestSession) {
        if (isAdminRequest) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        } else {
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          localStorage.removeItem('user');
          sessionStorage.removeItem('user');
          localStorage.removeItem('userId');
          sessionStorage.removeItem('userId');

          window.location.href = '/login';
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;