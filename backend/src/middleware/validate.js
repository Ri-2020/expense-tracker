/**
 * CONTENTS:
 * - validateExpense(req, res, next)  Validate POST /expenses request body
 *
 * Rules:
 *   amount      - required, numeric, > 0, max 2 decimal places
 *   category    - required, non-empty string
 *   description - required, non-empty string
 *   date        - required, ISO date string (YYYY-MM-DD)
 */

const AMOUNT_RE = /^\d+(\.\d{1,2})?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function validateExpense(req, res, next) {
  const { amount, category, description, date } = req.body;
  const errors = [];

  if (amount === undefined || amount === null || amount === "") {
    errors.push("amount is required");
  } else {
    const str = String(amount);
    if (!AMOUNT_RE.test(str) || Number(str) <= 0) {
      errors.push("amount must be a positive number with at most 2 decimal places");
    }
  }

  if (!category || !String(category).trim()) errors.push("category is required");
  if (!description || !String(description).trim()) errors.push("description is required");

  if (!date) {
    errors.push("date is required");
  } else if (!DATE_RE.test(date) || isNaN(Date.parse(date))) {
    errors.push("date must be a valid date in YYYY-MM-DD format");
  }

  if (errors.length) {
    return res.status(400).json({ error: "Validation failed", details: errors });
  }

  next();
}

module.exports = { validateExpense };
