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
  if (error) return <p style={{ ...styles.state, color: "#0d0d0d" }}>Error: {error}</p>;
  if (!expenses.length) return <p style={styles.state}>No expenses yet. Add one above.</p>;

  return (
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
            <tr key={e.id} className="et-tr">
              <td style={{ ...styles.td, color: "#9a9a9a", fontVariantNumeric: "tabular-nums", fontSize: "0.82rem" }}>{formatDate(e.date)}</td>
              <td style={styles.td}>
                <span className="et-badge">{e.category}</span>
              </td>
              <td style={{ ...styles.td, color: "#454545" }}>{e.description}</td>
              <td style={{ ...styles.td, textAlign: "right", fontVariantNumeric: "tabular-nums", fontWeight: 600, color: "#0d0d0d" }}>
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
  );
}

function formatDate(iso) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

const styles = {
  tableWrap: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" },
  th: { padding: "0.55rem 0.875rem", textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)", fontWeight: 600, fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.055em", color: "#9a9a9a" },
  td: { padding: "0.7rem 0.875rem", verticalAlign: "middle", borderBottom: "1px solid rgba(0,0,0,0.06)" },
  totalLabel: { padding: "0.7rem 0.875rem", fontWeight: 600, borderTop: "1px solid rgba(0,0,0,0.12)", textAlign: "right", color: "#9a9a9a", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.04em" },
  totalAmount: { padding: "0.7rem 0.875rem", fontWeight: 700, textAlign: "right", borderTop: "1px solid rgba(0,0,0,0.12)", fontVariantNumeric: "tabular-nums", fontSize: "1rem", color: "#0d0d0d" },
  state: { padding: "2.5rem", textAlign: "center", color: "#9a9a9a", fontSize: "0.875rem" },
};
