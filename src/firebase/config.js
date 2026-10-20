import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";

// Public project identification. Database rules, not these values, protect writes.
const firebaseConfig = {
  apiKey: "AIzaSyC5NCmGOvcvIF2f6cQejlzoatWE3hl9fZA",
  authDomain: "lifeonthisday-4d69a.firebaseapp.com",
  projectId: "lifeonthisday-4d69a",
  databaseURL: "https://lifeonthisday-4d69a-default-rtdb.firebaseio.com",
  storageBucket: "lifeonthisday-4d69a.firebasestorage.app",
  messagingSenderId: "651511248387",
  appId: "1:651511248387:web:044944ea9d0695840e8036",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
// Public identifier for Phila’s verified Google account; rules enforce the same UID.
export const ownerUID = "sieqz9C2ZGW9xrMKlhgj0jO543X2";
export const useEmulators = import.meta.env.DEV
  && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";

if (useEmulators) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectDatabaseEmulator(database, "127.0.0.1", 9000);
}

export const databaseURL = useEmulators
  ? "http://127.0.0.1:9000?ns=lifeonthisday-4d69a-default-rtdb"
  : firebaseConfig.databaseURL;
