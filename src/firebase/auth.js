import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { auth, ownerUID } from "./config.js";

export function isOwner(user) {
  return Boolean(user && ownerUID && user.uid === ownerUID && user.emailVerified);
}

export function subscribeToAuth(onUser, onError) {
  return onAuthStateChanged(auth, onUser, onError);
}

export async function signInOwner() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  const { user } = await signInWithPopup(auth, provider);

  // A Google login alone does not grant owner access. Match the pinned Firebase UID.
  if (!isOwner(user)) {
    await signOut(auth);
    throw new Error("This sign-in is reserved for the journal's owner.");
  }
  return user;
}

export function signOutOwner() {
  return signOut(auth);
}
