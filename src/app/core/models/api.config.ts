/**
 * Konfiguracja API endpoints
 */
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api',
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      REGISTER: '/auth/register',
      ACTIVATE: '/auth/activate',
      REFRESH: '/auth/refresh',
      LOGOUT: '/auth/logout'
    },
    REPORTS: {
      BASE: '/reports',
      UPLOAD: '/reports/upload',
      SUBMIT: '/reports/:id/submit',
      DOWNLOAD: '/reports/:id/download',
      CORRECTION: '/reports/:id/correction'
    },
    MESSAGES: {
      BASE: '/messages',
      SEND: '/messages',
      BULK: '/messages/bulk',
      SENT: '/messages/sent',
      CLOSE: '/messages/:id/close'
    },
    CASES: {
      BASE: '/cases',
      SUBMIT: '/cases/:id/submit',
      CANCEL: '/cases/:id/cancel'
    },
    LIBRARY: {
      BASE: '/library',
      DOWNLOAD: '/library/:id/download'
    },
    ANNOUNCEMENTS: '/announcements',
    FAQ: '/faq',
    SUBJECTS: '/subjects',
    CONTACT_GROUPS: '/contact-groups',
    ADMIN: {
      USERS: '/admin/users',
      BLOCK: '/admin/users/:id/block',
      UNBLOCK: '/admin/users/:id/unblock'
    }
  }
};

/**
 * Token storage keys
 */
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data'
};

/**
 * HTTP Headers
 */
export const HTTP_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept'
};
