/**
 * CONTENTS:
 * - CategorySummary({ summary, loading })
 *   Renders a compact per-category breakdown of total spending
 *
 * Props:
 *   summary  { category: string, total: string }[]
 *   loading  boolean
 */

export default function CategorySummary({ summary, loading }) {
  if (loading || !summary.length) return null;

  return (
    <div style={styles.wrap}>
      <h3 style={styles.heading}>Spending by Category</h3>
      <div style={styles.grid}>
        {summary.map((s) => (
          <div key={s.category} style={styles.card}>
            <span style={styles.cat}>{s.category}</span>
            <span style={styles.amount}>₹{s.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { background: "#fff", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,.1)", padding: "1.25rem", marginBottom: "1.5rem" },
  heading: { fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.75rem", color: "#374151" },
  grid: { display: "flex", gap: "0.75rem", flexWrap: "wrap" },
  card: { display: "flex", flexDirection: "column", gap: 2, background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 6, padding: "0.5rem 0.85rem", minWidth: 110 },
  cat: { fontSize: "0.78rem", color: "#6b7280", fontWeight: 500 },
  amount: { fontSize: "1rem", fontWeight: 700, color: "#111827", fontVariantNumeric: "tabular-nums" },
};
