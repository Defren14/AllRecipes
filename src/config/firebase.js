import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const loadFirebaseConfig = () => {
  const viteConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
  };

  if (viteConfig.apiKey && viteConfig.projectId) {
    return viteConfig;
  }

  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    return window.__FIREBASE_CONFIG__;
  }

  if (typeof process !== 'undefined' && process.env) {
    const reactConfig = {
      apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
      authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
      storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.REACT_APP_FIREBASE_APP_ID,
      measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    };

    if (reactConfig.apiKey && reactConfig.projectId) {
      return reactConfig;
    }
  }

    const missingMessage = `Firebase configuration not found.\n\n` +
      `Please provide your Firebase config via Vite environment variables (recommended) or ` +
      `other supported methods. Create a file named .env.local in the project root with the following entries (replace the placeholders):\n\n` +
      `VITE_FIREBASE_API_KEY=your_api_key\n` +
      `VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain\n` +
      `VITE_FIREBASE_PROJECT_ID=your_project_id\n` +
      `VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket\n` +
      `VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id\n` +
      `VITE_FIREBASE_APP_ID=your_app_id\n` +
      `VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id\n\n` +
      `After adding the file, restart the dev server so Vite picks up the new variables.`;

    console.error(missingMessage);
    throw new Error(missingMessage);
};

const firebaseConfig = loadFirebaseConfig();
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

let analytics = null;
try {
  analytics = getAnalytics(app);
} catch (e) {
  console.warn("Analytics initialization skipped:", e.message);
}

export { analytics };
export default app;