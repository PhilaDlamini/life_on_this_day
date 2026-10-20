import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { journalDay } from "./shared/journalDay.js";
import { PublicationError, publishMoment } from "./publishMoment.js";

initializeApp({
  databaseURL: process.env.FIREBASE_DATABASE_EMULATOR_HOST
    ? `http://${process.env.FIREBASE_DATABASE_EMULATOR_HOST}?ns=${process.env.GCLOUD_PROJECT}`
    : "https://lifeonthisday-4d69a-default-rtdb.firebaseio.com",
});

// All client database writes are denied. Only this authenticated server path publishes.
export const publishEntry = onCall({
  region: "us-central1", memory: "128MiB", cpu: "gcf_gen1",
  maxInstances: 1, concurrency: 1, timeoutSeconds: 30,
}, async (request) => {
  try {
    return await publishMoment(request, {
      commit: async (date, post) => {
        const result = await getDatabase().ref(`posts/${date}`).transaction((current) => {
          if (current !== null || journalDay() !== date) return;
          return post;
        }, undefined, false);
        return result.committed;
      },
    });
  } catch (error) {
    if (error instanceof PublicationError) throw new HttpsError(error.code, error.message);
    throw new HttpsError("internal", "The entry could not be saved. Your draft is still here—please try again.");
  }
});
