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
    <div className="et-card" style={styles.wrap}>
      <h3 style={styles.heading}>By Category</h3>
      <div style={styles.grid}>
        {summary.map((s) => (
          <div key={s.category} style={styles.item}>
            <span style={styles.cat}>{s.category}</span>
            <span style={styles.amount}>₹{s.total}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  wrap: { padding: "1.25rem", marginBottom: "1.25rem" },
  heading: { fontSize: "0.72rem", fontWeight: 600, marginBottom: "0.875rem", color: "#9a9a9a", textTransform: "uppercase", letterSpacing: "0.06em" },
  grid: { display: "flex", gap: "0.625rem", flexWrap: "wrap" },
  item: { display: "flex", flexDirection: "column", gap: 3, background: "#fafaf8", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 4, padding: "0.6rem 0.9rem", minWidth: 100 },
  cat: { fontSize: "0.68rem", color: "#9a9a9a", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  amount: { fontSize: "1.05rem", fontWeight: 700, color: "#0d0d0d", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.01em" },
};
