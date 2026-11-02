import type { CapacitorConfig } from '@capacitor/cli';

/**
 * LaunchCommerce Admin — Capacitor Configuration
 * Package ID: com.launchcommerce.admin
 * App Name: LaunchCommerce Admin
 * Entry: /dashboard
 * Theme: Midnight Royal Blue (#070B24 canvas, #0A1030 status bar)
 */

// Environment-based URL resolution:
// - Set CAPACITOR_SERVER_URL=http://10.0.2.2:3000 (Android emulator local dev)
// - Or CAPACITOR_SERVER_URL=https://app.launchcommerce.io (production hosted server)
// const serverBase = (process.env.CAPACITOR_SERVER_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://app.launchcommerce.io').replace(/\/+$/, '');
const serverBase = ('https://storeme-6uzb.vercel.app').replace(/\/+$/, '');


const config: CapacitorConfig = {
  appId: 'com.launchcommerce.admin',
  appName: 'LaunchCommerce Admin',
  webDir: 'public',
  server: {
    url: `${serverBase}/dashboard`,
    cleartext: serverBase.startsWith('http://'),
    allowNavigation: [
      'storeme-6uzb.vercel.app',
      '*.vercel.app',
      'launchcommerce.io',
      '*.launchcommerce.io',
      'accounts.google.com',
      '*.google.com',
      'api.razorpay.com',
      '*.razorpay.com',
      'res.cloudinary.com',
      '10.0.2.2*',
      'localhost*',
    ],
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      backgroundColor: '#0A1030',
      style: 'DARK',
    },
    SplashScreen: {
      backgroundColor: '#070B24',
      showSpinner: true,
      spinnerColor: '#4169E1',
      launchShowDuration: 2000,
      launchAutoHide: true,
    },
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: process.env.NODE_ENV === 'development',
  },
};

export default config;

