export const STORAGE = {
  INIT: 'easyvacc_initialized',
  USERS: 'easyvacc_users',
  SESSION_USER_ID: 'easyvacc_session_user_id',
  VACCINES: 'easyvacc_vaccines',
  POSTOS: 'easyvacc_postos',
  EMPLOYEES: 'easyvacc_employees',
  FAVORITES_PREFIX: 'easyvacc_favorites_',
  HISTORY_PREFIX: 'easyvacc_history_',
  THEME_PREF: 'easyvacc_theme_pref',
  /** Incrementar ao alterar postos padrão (migração local). */
  POSTOS_VERSION: 'easyvacc_postos_version',
} as const;
