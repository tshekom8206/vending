// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appName: 'Khanyi Solutions Admin',
  appVersion: '1.0.0',

  // Khanyi API Configuration
  apiUrl: 'http://localhost:3000/api/v1',
  apiTimeout: 30000,

  // Authentication
  defaultauth: 'khanyi', // Changed from 'fackbackend' to our auth
  tokenKey: 'khanyi_admin_token',
  userKey: 'khanyi_admin_user',

  // Features
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableReports: true,
    enableBulkOperations: true,
    enableRealTimeUpdates: true
  },

  // System limits
  limits: {
    maxFileSize: 10485760, // 10MB
    maxBulkOperations: 1000,
    rateLimitPerMinute: 100
  },

  // Firebase Config (keep for existing template features if needed)
  firebaseConfig: {
    apiKey: 'AIzaSyAIrRUP8z39yFhjsfnLsxwDhzxzAguzHvI',
    authDomain: 'vixon-angular.firebaseapp.com',
    databaseURL: '',
    projectId: 'vixon-angular',
    storageBucket: 'vixon-angular.appspot.com',
    messagingSenderId: '822277458131',
    appId: '1:822277458131:web:5ec3bee2543b96567aac26',
    measurementId: 'G-YPD27EXC6H'
  }
};



/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
