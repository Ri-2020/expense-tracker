/**
 * CONTENTS:
 * - exports.api   Firebase Cloud Function (HTTPS gen2) wrapping the Express app
 *
 * Entry point for Cloud Functions deployment (package.json "main" points here).
 * Local dev still uses server.js directly via `npm start`.
 */

const { onRequest } = require("firebase-functions/v2/https");
const { initDb } = require("./db");
const { app } = require("./server");

// Initialize Firestore at cold-start so the first request isn't delayed
initDb();

exports.api = onRequest({ region: "asia-south1", cors: true }, app);
