/**
 * CONTENTS:
 * - Express app setup  (CORS, JSON body parsing, routes, global error handler)
 * - startServer()      Bind to PORT (default 3001) and initialize DB
 *
 * Routes mounted:
 *   /expenses  ->  src/routes/expenses.js
 */

const express = require("express");
const cors = require("cors");
const { initDb } = require("./db");
const expensesRouter = require("./routes/expenses");
const { requireAuth } = require("./middleware/auth");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/expenses", requireAuth, expensesRouter);

// Health check
app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Global error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

function startServer(port = process.env.PORT || 3001) {
  initDb();
  return app.listen(port, () => {
    console.log(`Expense Tracker API listening on port ${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
