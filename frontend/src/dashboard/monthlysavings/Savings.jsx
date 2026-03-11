import "./Savings.css"
import { useEffect } from "react";
import useGoalPlan from "../../hooks/useGoalPlan";
import Chart from "./Chart/Chart"

/*
   ========================
	 Monthly Savings Card
   ======================== 
*/

function MonthlySavings() {


	const { plan, fetchMyPlan } = useGoalPlan();

	useEffect(() => {
		fetchMyPlan();
	}, [fetchMyPlan]);


	// Difference in dollars
	const now = new Date();

	// Difference percentage
	const month = now.toLocaleString("en-US", { month: "long" });
	const target = plan?.targetSavingsMonthly ?? 0;

	const monthlyIncome = Number(plan?.monthlyIncome ?? 0);
	const fixedExpensesMonthly = Number(plan?.fixedExpensesMonthly ?? 0);
	const targetSavingsMonthly = Number(plan?.targetSavingsMonthly ?? 0);
	
	const availableToSave = Math.max(monthlyIncome - fixedExpensesMonthly, 0);
	const progressPercent =
		availableToSave > 0
			? Math.min((targetSavingsMonthly / availableToSave) * 100, 100)
			: 0;

	return (
		<div className="savings-card">
			<p className="card-title">
				<b>Monthly Savings</b>
			</p>

			<p className="card-text">
				{month} Target

			</p>

			<p className="balance-text">
				${target.toLocaleString()}
			</p>

			<p className="savings-text">
				Your savings goal for this month
			</p>


			<Chart value={progressPercent} />

		</div>
	);
}

export default MonthlySavings;
