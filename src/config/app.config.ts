/**
 * Application configuration constants
 */
export const APP_CONFIG = {
  NAME: 'FiNart',
  FULL_NAME: 'Financial Art',
  DESCRIPTION: 'Vietnamese Stock Trading Advisory System',
  VERSION: '0.0.1',
  API_PREFIX: 'api',
};

/**
 * Returns the application name and version
 */
export const getAppNameAndVersion = (): string => {
  return `${APP_CONFIG.NAME} v${APP_CONFIG.VERSION}`;
};

/**
 * Returns the full application description
 */
export const getAppDescription = (): string => {
  return `${APP_CONFIG.FULL_NAME} - ${APP_CONFIG.DESCRIPTION}`;
}; 