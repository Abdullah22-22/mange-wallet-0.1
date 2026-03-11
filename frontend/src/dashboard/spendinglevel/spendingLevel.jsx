import { useMemo } from "react";
import Chart from "./Chart/Chart";
import Week from "./week/week";
import "./spendingLevel.css"

function SpendingLevel({ raw, data }) {

  /* =========================
     DATA SOURCE
     ========================= */
  const source = raw ?? data;


  /* =========================
     PREPARE VIEW DATA
     ========================= */
  const view = useMemo(() => {
    if (!source) return { currency: "EUR", points: [] };
    return Week(source, "sum");
  }, [source]);

  if (!source) return null;


  /* =========================
     RENDER
     ========================= */

  return (
    <div className="sl-card">

      {/* ===== Header ===== */}
      <div className="sl-header">
        <div className="sl-title">Spending Level</div>
      </div>

      {/* ===== Chart ===== */}
      <Chart points={view.points} />

      {/* ===== Legend ===== */}
      <div className="sl-legend">
        <div className="sl-legendItem">
          <span className="sl-dot"></span>
          Weekdays
        </div>

        <div className="sl-divider"></div>

        <div className="sl-legendItem">
          <span className="sl-dot sl-dotDim"></span>
          Weekends
        </div>
      </div>

    </div>
  );
}

export default SpendingLevel
