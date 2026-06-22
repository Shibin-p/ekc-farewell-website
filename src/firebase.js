import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCoGrpaw__pthI7nFpR6EF5cAwDSv_G4Dk",
  authDomain: "farewell-invitation-cddd2.firebaseapp.com",
  projectId: "farewell-invitation-cddd2",
  storageBucket: "farewell-invitation-cddd2.firebasestorage.app",
  messagingSenderId: "955752482398",
  appId: "1:955752482398:web:c9836267ada61e18d3d6cf",
  measurementId: "G-NR9NQWVBLC"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Safely initialize analytics (resolves to null if not supported, e.g. in SSR or test environments)
export const analyticsPromise = isSupported().then((supported) => {
  if (supported) {
    return getAnalytics(app);
  }
  return null;
});
