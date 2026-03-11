import { useMemo } from "react";
import Chart from "./Chart/Chart";
import Month from "./Month/Month";
import "./SpendingInsights.css";

function SpendingInsights({ raw, data }) {
    /* =========================
     DATA SOURCE
     ========================= */
    const source = raw ?? data;

    /* =========================
         PREPARE VIEW DATA
         ========================= */
    const view = useMemo(() => {

        if (!source) {
            return { currency: "EUR", points: [], markerIndex: 0 }
        }
        return Month(source);
    }, [source]);

    /* =========================
       GUARD (NO DATA)
       ========================= */
    if (!source) return null;

    return (
        <div className="si-card">

            {/* ===== Header ===== */}
            <div className="si-header">
                <div className="si-title">Spending Insights</div>

                <div className="si-badge">
                    <span className="si-badgeDot"></span>
                    New Transactions
                </div>
            </div>

            {/* ===== Chart ===== */}
            < Chart points={view.points} markerIndex={view.markerIndex} />

        </div>
    );
};

export default SpendingInsights

