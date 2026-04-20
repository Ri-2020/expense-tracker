/**
 * CONTENTS:
 * - POST /expenses         createExpenseHandler  Create expense; idempotent via Idempotency-Key header
 * - GET  /expenses         listExpensesHandler   List with optional ?category= and ?sort=date_desc
 * - GET  /expenses/summary summaryHandler        Total per category
 *
 * Idempotency:
 *   Client sends `Idempotency-Key: <uuid>` header.
 *   createExpense() handles dedup atomically via Firestore transaction.
 *   Duplicate key → 200 with original expense. New → 201.
 */

const { Router } = require("express");
const { validateExpense } = require("../middleware/validate");
const { createExpense, listExpenses, getCategorySummary } = require("../models/expense");

const router = Router();

router.post("/", validateExpense, async (req, res, next) => {
  try {
    const idempotencyKey = req.headers["idempotency-key"] || null;
    const { existing, expense } = await createExpense({ ...req.body, idempotencyKey, uid: req.user.uid });
    return res.status(existing ? 200 : 201).json(expense);
  } catch (err) {
    next(err);
  }
});

router.get("/", async (req, res, next) => {
  try {
    const { category, sort } = req.query;
    const expenses = await listExpenses({ category: category || null, sort: sort || null, uid: req.user.uid });
    const totalPaise = expenses.reduce((sum, e) => sum + Math.round(Number(e.amount) * 100), 0);
    const total = (totalPaise / 100).toFixed(2);
    res.json({ expenses, total });
  } catch (err) {
    next(err);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    res.json(await getCategorySummary({ uid: req.user.uid }));
  } catch (err) {
    next(err);
  }
});

module.exports = router;
