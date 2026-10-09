/**
 * Konfigurasi Autentikasi Google SSO (Single Sign-On) & Layanan Cloud Gratis (Firebase Firestore REST)
 */
const decodeB64 = (s: string) => {
  try {
    return atob(s);
  } catch {
    return Buffer.from(s, 'base64').toString('utf-8');
  }
};

export const AUTH_GOOGLE_CONFIG = {
  // Client ID Web Application Google Cloud
  clientId: decodeB64('NTYxNTg3NzQ1NzU3LXNrdGcxZ2Vka2cydTJpa25sbDBndWNtYm5zazA3YnNsLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29t'),
  clientSecret: decodeB64('R0NDU1BYLTBsSFFqT1Z6dGNCRXV3MmFCSDgxamJlX2xKckg='),
  authEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  userInfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  scopes: ['openid', 'email', 'profile'],
};

/**
 * Konfigurasi Layanan Cloud Gratis (Firebase Firestore Free Spark Tier).
 * Firestore gratis: 50.000 bacaan & 20.000 tulisan per hari (sangat cukup untuk edukasi anak).
 */
export const FREE_CLOUD_CONFIG = {
  projectId: 'bacalah-app',
  apiKey: 'AIzaSyDrVRKiZ26ElZaqRmsn15VxakJY6U84Wso', // Firebase Web API Key
  firestoreEndpoint: (collection: string, docId: string) =>
    `https://firestore.googleapis.com/v1/projects/bacalah-app/databases/(default)/documents/${collection}/${docId}`,
};
