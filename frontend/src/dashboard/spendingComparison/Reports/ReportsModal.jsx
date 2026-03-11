import "./ReportsModal.css";



/* =========================
   HELPERS
   ========================= */
const money = (currency, v = 0) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(Number(v) || 0);


/* =========================
 REPORTS MODAL
 Day-by-day comparison table
 ========================= */
function ReportsModal({ open, onClose, data }) {

  /* =========================
    VISIBILITY GUARD
    ========================= */
  if (!open || !data) return null;

  /* =========================
   DATA
   ========================= */
  const currency = data.currency || "EUR";
  const series = data.series || [];

  const last = series.find((s) => s.id === "last_month");
  const current = series.find((s) => s.id === "this_month");

  if (!last || !current) return null;

  /* =========================
    NORMALIZE DAILY VALUES
    ========================= */
  const lastMap = new Map
    (last.data.map((p) => [String(p.x), Number(p.y)]));

  const currentMap = new Map
    (current.data.map((p) => [String(p.x), Number(p.y)]));

  const days = Array.from(
    new Set([...lastMap.keys(), ...currentMap.keys()]))
    .sort((a, b) => Number(a) - Number(b));


  /* =========================
  RENDER
  ========================= */

  return (
    <div className="rm-backdrop" onClick={onClose}>
      <div className="rm-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rm-header">
          <div className="rm-title">Monthly Report</div>
          <button className="rm-close" onClick={onClose}>✕</button>
        </div>

        <div className="rm-tableWrap">
          <table className="rm-table">
            <thead>
              <tr>
                <th>Day</th>
                <th>Last Month</th>
                <th>This Month</th>
              </tr>
            </thead>

            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td>{day}</td>
                  <td>{money(currency, lastMap.get(day) ?? 0)}</td>
                  <td>{money(currency, currentMap.get(day) ?? 0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rm-actions">
          <button className="rm-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportsModal;