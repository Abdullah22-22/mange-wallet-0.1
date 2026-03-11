import { useState } from "react";
import Chart from "./Chart/Chart";
import "./SpendingComparison.css";
import ReportsModal from "./Reports/ReportsModal";


/* =========================
   SPENDING COMPARISON CARD
   Dashboard widget controller
   ========================= */

function SpendingComparison({ data }) {

  /*=========================
      LOCAL STATE
    ========================= */
  const [open, setOpen] = useState(false);

  /* =========================
   GUARD
   Prevent render without data
   ========================= */
  if (!data) return null;


  /* =========================
     NORMALIZE INPUT DATA
     ========================= */

  const series = data.series ?? [];
  const totals = data.totals ?? {
    lastMonthTotal: 0,
    thisMonthTotal: 0
  };


  /* =========================
     RENDER
     ========================= */

  return (
    <div className="sc-card">
      {/* =========================
         HEADER
         ========================= */}
      <div className="sc-header">
        <div className="sc-title">Spending Comparison</div>

        <div className="sc-tabs">
          <div className="sc-tab">
            <span className="sc-dot"></span>
            Total Comparisons
          </div>

        </div>
      </div>

      {/* =========================
         CHART
         ========================= */}

      <Chart series={series} />



      {/* =========================
         FOOTER TOTALS
         ========================= */}
      <div className="sc-footer">
        <div>
          <div className="sc-metricLabel">
            <span className="sc-bullet sc-bulletGreen"></span>
            Last Month
          </div>
          <div className="sc-metricValue">€{totals.lastMonthTotal}</div>
        </div>

        <div className="sc-divider"></div>

        <div>
          <div className="sc-metricLabel">
            <span className="sc-bullet sc-bulletPink"></span>
            This Month
          </div>
          <div className="sc-metricValue">€{totals.thisMonthTotal}</div>
        </div>


        {/* =========================
           OPEN REPORT MODAL
           ========================= */}
        <button className="sc-btn"
          onClick={() => setOpen(true)}
        >
          View Reports ..
        </button>
      </div>

      <ReportsModal open={open} onClose={() => setOpen(false)} data={data} />
    </div>
  );
}

export default SpendingComparison;