export const STORAGE = {
  INIT: 'easyvacc_initialized',
  /** JWT da easyvacc-api quando `EXPO_PUBLIC_API_URL` está definido. */
  API_TOKEN: 'easyvacc_api_token',
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
  /** Carteira de vacinação por usuário (JSON: doses completas). */
  WALLET_PREFIX: 'easyvacc_wallet_',
  /** Lista global de aplicações registradas pelo admin (demonstração). */
  VACCINE_APPLICATIONS: 'easyvacc_vaccine_applications',
} as const;
