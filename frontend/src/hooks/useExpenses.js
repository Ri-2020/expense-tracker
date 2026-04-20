/**
 * CONTENTS:
 * - useExpenses(filters)  Custom hook: loads expenses from API, exposes reload()
 *                         Returns { expenses, total, loading, error, reload }
 * - useCategories()       Derives the unique category list from fetched expenses
 *                         Returns { summary, summaryLoading }
 *
 * Behaviour:
 *   Re-fetches automatically when filters (category, sort) change.
 *   Aborts in-flight fetch if filters change before response arrives (avoids stale updates).
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchExpenses, fetchSummary } from "../api/expenses";

export function useExpenses({ category, sort }) {
  const [expenses, setExpenses] = useState([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const load = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchExpenses({ category, sort });
      if (!ctrl.signal.aborted) {
        setExpenses(data.expenses);
        setTotal(data.total);
      }
    } catch (err) {
      if (!ctrl.signal.aborted) setError(err.message);
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, [category, sort]);

  useEffect(() => {
    load();
    return () => abortRef.current?.abort();
  }, [load]);

  return { expenses, total, loading, error, reload: load };
}

export function useSummary(refreshToken) {
  const [summary, setSummary] = useState([]);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    setSummaryLoading(true);
    fetchSummary()
      .then(setSummary)
      .catch(() => {})
      .finally(() => setSummaryLoading(false));
  }, [refreshToken]);

  return { summary, summaryLoading };
}
