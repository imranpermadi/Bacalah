/**
 * Konfigurasi Autentikasi Google SSO (Single Sign-On)
 */
const decodeB64 = (s: string) => {
  try {
    return atob(s);
  } catch {
    return Buffer.from(s, 'base64').toString('utf-8');
  }
};

export const AUTH_GOOGLE_CONFIG = {
  clientId: decodeB64('NTYxNTg3NzQ1NzU3LXNrdGcxZ2Vka2cydTJpa25sbDBndWNtYm5zazA3YnNsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t'),
  clientSecret: decodeB64('R0NDU1BYLTBsSFFqT1Z6dGNCRXV3MmFCSDgxamJlX2xKckg='),
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  scopes: ['openid', 'email', 'profile'],
};
