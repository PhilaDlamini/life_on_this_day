import { useEffect, useState } from "react";
import { isOwner, signInOwner, signOutOwner, subscribeToAuth } from "../firebase/auth.js";

const signInErrors = {
  "auth/unauthorized-domain": "This address needs to be added to Firebase's authorized domains.",
  "auth/operation-not-allowed": "Google sign-in needs to be enabled in Firebase Authentication.",
  "auth/popup-blocked": "Please allow the Google sign-in popup, then try again.",
  "auth/network-request-failed": "Check your connection, then try signing in again.",
};

export default function useOwnerAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => subscribeToAuth((user) => {
    setUser(user);
    setLoading(false);
  }, () => {
    setError("Sign-in could not be checked. Please refresh and try again.");
    setLoading(false);
  }), []);

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (error) {
      if (error.code !== "auth/popup-closed-by-user") {
        setError(signInErrors[error.code] || (error.code ? "Sign-in could not be completed. Please try again." : error.message));
      }
    } finally {
      setBusy(false);
    }
  }

  return {
    user, isOwner: isOwner(user), loading, busy, error,
    signIn: () => run(signInOwner),
    signOut: () => run(signOutOwner),
  };
}
