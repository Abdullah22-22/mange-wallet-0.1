import "./content.css";
import { useOutletContext } from "react-router-dom";
import SpendingComparison from "../../dashboard/spendingComparison/SpendingComparison";
import SpendingLevel from "../../dashboard/spendinglevel/spendingLevel";
import SpendingInsights from "../../dashboard/SpendingInsights/SpendingInsights";
import Savings from "../../dashboard/monthlysavings/Savings";
import TodaysSpending from "../../dashboard/todaysSpending/TodaysSpending";
import TopExpenses from "../../dashboard/TopExpenses/TopExpenses";
import SaveOnBill from "../../dashboard/SaveonBills/SaveonBills";
import InvestingBasics from "../../dashboard/InvestingBasics/InvestingBasics";

import useSpendingDashboard from "../../hooks/useSpendingDashboard";
import useTrueLayerSpendingDashboard from "../../hooks/useTrueLayerSpendingDashboard";

import { useState } from "react";
import DashboardAnimation from "../../pages/Dashboard/DashboardAnimation";

function Content() {
  const outletCtx = useOutletContext?.() || {};
  const source = outletCtx.source || "local";

  const local = useSpendingDashboard("EUR");
  const truelayer = useTrueLayerSpendingDashboard("GBP");

  const { data, loading, error } =
    source === "local" ? local : truelayer;

  const [showAnimation, setShowAnimation] = useState(true);

  if (loading) return <div className="content">Loading...</div>;
  if (error) return <div className="content">Error loading data</div>;
  if (!data) return null;

  const today = data.today ?? data;
  const weekly = data.report?.weekly;
  const monthly = data.report?.monthly;
  const yearly = data.report?.yearly;
  const topCategories = data.top?.topCategories ?? [];

  
  return (
    <div className="content">
      {showAnimation && (
        <DashboardAnimation onComplete={() => setShowAnimation(false)} />
      )}

      <div className="box large-1">
        <TodaysSpending data={today} />
      </div>

      <div className="box medium-1">
        <SpendingLevel data={weekly} />
      </div>

      <div className="box large-2">
        <TopExpenses data={topCategories} />
      </div>

      <div className="box medium-2">
        <SpendingComparison data={monthly} />
      </div>

      <div className="box col-1">
        <Savings />

      </div>

      <div className="box col-2">
        <SpendingInsights data={yearly} />
      </div>

      <div className="box col-3">
        <SaveOnBill data={monthly} />
      </div>

      <div className="box col-4">
        <InvestingBasics data={yearly} />
      </div>

    </div>
  );
}

export default Content;