/**
 * CONTENTS:
 * - ExpenseList({ expenses, total, loading, error })
 *   Renders a table of expenses and the running total footer
 *
 * Props:
 *   expenses  Expense[]   array of expense objects from the API
 *   total     string      pre-computed total string (e.g. "1234.50")
 *   loading   boolean
 *   error     string|null
 */

export default function ExpenseList({ expenses, total, loading, error }) {
  if (loading) return <p style={styles.state}>Loading expenses…</p>;
  if (error) return <p style={{ ...styles.state, color: "#dc2626" }}>Error: {error}</p>;
  if (!expenses.length) return <p style={styles.state}>No expenses found. Add one above.</p>;

  return (
    <div>
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Date", "Category", "Description", "Amount (₹)"].map((h) => (
                <th key={h} style={styles.th}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {expenses.map((e) => (
              <tr key={e.id} style={styles.tr}>
                <td style={styles.td}>{formatDate(e.date)}</td>
                <td style={styles.td}>
                  <span style={styles.badge}>{e.category}</span>
                </td>
                <td style={styles.td}>{e.description}</td>
                <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  ₹{e.amount}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={styles.totalLabel}>Total</td>
              <td style={styles.totalAmount}>₹{total}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const styles = {
  tableWrap: { overflowX: "auto", borderRadius: 8, boxShadow: "0 1px 3px rgba(0,0,0,.1)" },
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: "0.9rem" },
  th: { padding: "0.65rem 0.9rem", textAlign: "left", borderBottom: "2px solid #e5e7eb", fontWeight: 600, background: "#f9fafb", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.04em", color: "#6b7280" },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "0.65rem 0.9rem", verticalAlign: "middle" },
  badge: { background: "#eff6ff", color: "#1d4ed8", padding: "0.2rem 0.55rem", borderRadius: 12, fontSize: "0.78rem", fontWeight: 500 },
  totalLabel: { padding: "0.65rem 0.9rem", fontWeight: 700, borderTop: "2px solid #e5e7eb", textAlign: "right", color: "#374151" },
  totalAmount: { padding: "0.65rem 0.9rem", fontWeight: 700, textAlign: "right", borderTop: "2px solid #e5e7eb", fontVariantNumeric: "tabular-nums", fontSize: "1rem" },
  state: { padding: "2rem", textAlign: "center", color: "#6b7280" },
};
