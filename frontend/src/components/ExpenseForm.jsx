/**
 * CONTENTS:
 * - ExpenseForm({ onCreated })  Controlled form for adding a new expense
 *
 * Idempotency:
 *   A new UUID is generated on mount and after each successful submit.
 *   Re-submitting (double-click, retry) sends the same key until success → no duplicates.
 *
 * Props:
 *   onCreated(expense) — called after a successful POST
 */

import { useState, useRef } from "react";
import { createExpense } from "../api/expenses";

const CATEGORIES = ["Food", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Other"];

function newKey() {
  return crypto.randomUUID();
}

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState({ amount: "", category: CATEGORIES[0], description: "", date: today() });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const idempotencyKey = useRef(newKey());

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    // Client-side guard: amount must be > 0
    if (!form.amount || Number(form.amount) <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const expense = await createExpense(form, idempotencyKey.current);
      idempotencyKey.current = newKey(); // rotate key only on success
      setForm((f) => ({ ...f, amount: "", description: "" }));
      onCreated(expense);
    } catch (err) {
      setError(err.message);
      // Keep same key so a retry is idempotent
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="et-card" style={styles.form}>
      <h2 style={styles.heading}>Add Expense</h2>

      {error && <p className="et-error">{error}</p>}

      <div style={styles.row}>
        <label style={styles.label}>
          <span style={styles.labelText}>Amount (₹)</span>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            required
            className="et-input"
          />
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Category</span>
          <select name="category" value={form.category} onChange={handleChange} className="et-input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          <span style={styles.labelText}>Date</span>
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            className="et-input"
          />
        </label>
      </div>

      <label style={{ ...styles.label, width: "100%" }}>
        <span style={styles.labelText}>Description</span>
        <input
          name="description"
          type="text"
          placeholder="What was this for?"
          value={form.description}
          onChange={handleChange}
          required
          className="et-input"
        />
      </label>

      <button type="submit" disabled={submitting} className="et-btn" style={styles.submitBtn}>
        {submitting ? "Saving…" : "Add Expense"}
      </button>
    </form>
  );
}

const styles = {
  form: { padding: "1.5rem", marginBottom: "1.25rem" },
  heading: { marginBottom: "1.25rem", fontSize: "0.95rem", fontWeight: 700, letterSpacing: "-0.01em", color: "#0d0d0d" },
  row: { display: "flex", gap: "0.875rem", flexWrap: "wrap", marginBottom: "0.875rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1, minWidth: 140 },
  labelText: { fontSize: "0.72rem", fontWeight: 600, color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.05em" },
  submitBtn: { marginTop: "1.25rem" },
};
