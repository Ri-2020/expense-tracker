/**
 * CONTENTS:
 * - toPaise(amount)              Convert decimal rupee string/number to integer paise
 * - toRupees(paise)              Convert integer paise to 2-decimal rupee string
 * - serialize(row)               Convert a Firestore doc to the public API shape
 * - createExpense(data)          Write new expense; handles idempotency via Firestore transaction
 *                                Returns { existing: bool, expense: object }
 * - listExpenses({ category })   Fetch all expenses, filter + sort in memory
 * - getCategorySummary()         Return total paise grouped by category (in-memory aggregation)
 */

const { randomUUID } = require("crypto");
const { getDb } = require("../db");

function toPaise(amount) {
  return Math.round(Number(amount) * 100);
}

function toRupees(paise) {
  return (paise / 100).toFixed(2);
}

function serialize(doc) {
  return {
    id: doc.id,
    amount: toRupees(doc.amount_paise),
    category: doc.category,
    description: doc.description,
    date: doc.date,
    created_at: doc.created_at,
  };
}

async function createExpense({ amount, category, description, date, idempotencyKey, uid }) {
  const db = getDb();
  const now = new Date().toISOString();
  const paise = toPaise(amount);
  const expenseData = {
    amount_paise: paise,
    category: category.trim(),
    description: description.trim(),
    date,
    created_at: now,
    idempotency_key: idempotencyKey || null,
  };

  const expensesCol = db.collection("users").doc(uid).collection("expenses");
  const keysCol = db.collection("users").doc(uid).collection("idempotency_keys");

  if (idempotencyKey) {
    const keyRef = keysCol.doc(idempotencyKey);
    let result;

    await db.runTransaction(async (tx) => {
      const keySnap = await tx.get(keyRef);
      if (keySnap.exists) {
        const expSnap = await tx.get(expensesCol.doc(keySnap.data().expense_id));
        result = { existing: true, expense: serialize({ id: expSnap.id, ...expSnap.data() }) };
        return;
      }
      const id = randomUUID();
      tx.set(expensesCol.doc(id), expenseData);
      tx.set(keyRef, { expense_id: id });
      result = { existing: false, expense: serialize({ id, ...expenseData }) };
    });

    return result;
  }

  const id = randomUUID();
  await expensesCol.doc(id).set(expenseData);
  return { existing: false, expense: serialize({ id, ...expenseData }) };
}

async function listExpenses({ category, sort, uid } = {}) {
  const db = getDb();
  const snap = await db.collection("users").doc(uid).collection("expenses").get();
  let rows = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  if (category) {
    rows = rows.filter((r) => r.category.toLowerCase() === category.toLowerCase());
  }

  rows.sort((a, b) => {
    const cmp = sort === "date_asc"
      ? a.date.localeCompare(b.date)
      : b.date.localeCompare(a.date);
    if (cmp !== 0) return cmp;
    return sort === "date_asc"
      ? a.created_at.localeCompare(b.created_at)
      : b.created_at.localeCompare(a.created_at);
  });

  return rows.map(serialize);
}

async function getCategorySummary({ uid } = {}) {
  const db = getDb();
  const snap = await db.collection("users").doc(uid).collection("expenses").get();
  const totals = {};

  snap.docs.forEach((doc) => {
    const { category, amount_paise } = doc.data();
    const key = category.toLowerCase();
    if (!totals[key]) totals[key] = { category, total_paise: 0 };
    totals[key].total_paise += amount_paise;
  });

  return Object.values(totals)
    .sort((a, b) => b.total_paise - a.total_paise)
    .map((r) => ({ category: r.category, total: toRupees(r.total_paise) }));
}

module.exports = { createExpense, listExpenses, getCategorySummary };
