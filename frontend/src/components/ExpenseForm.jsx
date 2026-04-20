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
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Add Expense</h2>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.row}>
        <label style={styles.label}>
          Amount (₹)
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Category
          <select name="category" value={form.category} onChange={handleChange} style={styles.input}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>

        <label style={styles.label}>
          Date
          <input
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </label>
      </div>

      <label style={styles.label}>
        Description
        <input
          name="description"
          type="text"
          placeholder="What was this for?"
          value={form.description}
          onChange={handleChange}
          required
          style={{ ...styles.input, width: "100%" }}
        />
      </label>

      <button type="submit" disabled={submitting} style={submitting ? styles.btnDisabled : styles.btn}>
        {submitting ? "Saving…" : "Add Expense"}
      </button>
    </form>
  );
}

const styles = {
  form: { background: "#fff", padding: "1.5rem", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,.1)", marginBottom: "1.5rem" },
  heading: { marginBottom: "1rem", fontSize: "1.1rem", fontWeight: 600 },
  row: { display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "0.75rem" },
  label: { display: "flex", flexDirection: "column", gap: "0.3rem", fontSize: "0.875rem", fontWeight: 500, flex: 1, minWidth: 140 },
  input: { padding: "0.45rem 0.6rem", border: "1px solid #d1d5db", borderRadius: 6, fontSize: "0.95rem", marginTop: 2 },
  btn: { marginTop: "1rem", padding: "0.5rem 1.25rem", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: "0.95rem" },
  btnDisabled: { marginTop: "1rem", padding: "0.5rem 1.25rem", background: "#93c5fd", color: "#fff", border: "none", borderRadius: 6, cursor: "not-allowed", fontWeight: 600, fontSize: "0.95rem" },
  error: { color: "#dc2626", fontSize: "0.875rem", marginBottom: "0.75rem", background: "#fef2f2", padding: "0.5rem", borderRadius: 4 },
};
