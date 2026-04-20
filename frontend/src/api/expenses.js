import { auth } from "../firebase";

const BASE = "/expenses";

async function getAuthHeader() {
  const token = await auth.currentUser?.getIdToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse(res) {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error || (body.details && body.details.join(", ")) || msg;
    } catch {}
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchExpenses({ category, sort } = {}) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  const qs = params.toString();
  return handleResponse(
    await fetch(`${BASE}${qs ? `?${qs}` : ""}`, { headers: await getAuthHeader() })
  );
}

export async function createExpense(data, idempotencyKey) {
  return handleResponse(
    await fetch(BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
        ...(await getAuthHeader()),
      },
      body: JSON.stringify(data),
    })
  );
}

export async function fetchSummary() {
  return handleResponse(
    await fetch(`${BASE}/summary`, { headers: await getAuthHeader() })
  );
}
