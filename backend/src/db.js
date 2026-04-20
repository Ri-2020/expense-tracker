/**
 * CONTENTS:
 * - initDb()     Initialize Firestore via firebase-admin; safe to call multiple times
 * - getDb()      Return the singleton Firestore instance
 *
 * Persistence: Firestore (Firebase Admin SDK)
 * - Stateless-friendly: no local file, survives Cloud Function cold starts
 * - Admin SDK auto-authenticates via the function's service account in GCP,
 *   or via GOOGLE_APPLICATION_CREDENTIALS locally
 * - amount stored as INTEGER (paise = rupees * 100) to avoid floating-point errors
 * - idempotency enforced via Firestore transaction on the idempotency_keys collection
 */

const admin = require("firebase-admin");

let db;

function initDb() {
  if (!admin.apps.length) {
    admin.initializeApp();
  }
  db = admin.firestore();
  return db;
}

function getDb() {
  if (!db) return initDb();
  return db;
}

module.exports = { initDb, getDb };
