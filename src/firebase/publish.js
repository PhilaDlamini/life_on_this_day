import { connectFunctionsEmulator, getFunctions, httpsCallable } from "firebase/functions";
import { app, useEmulators } from "./config.js";

const functions = getFunctions(app, "us-central1");
if (useEmulators) connectFunctionsEmulator(functions, "127.0.0.1", 5001);
const publishEntry = httpsCallable(functions, "publishEntry");

export async function commitPost(date, post) {
  const result = await publishEntry({ date, post });
  return result.data.date;
}
