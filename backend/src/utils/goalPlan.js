export function calcPlan({ monthlyIncome, targetSavingsMonthly, difficulty }) {
    const diffFactor = difficulty === "easy" ? 0.9 : difficulty === "medium" ? 1.0 : 1.1;

    const adjustedTarget = Math.max(0, targetSavingsMonthly * diffFactor);
    const weeklySavings = adjustedTarget / 4;

    const weeklyIncome = monthlyIncome / 4;
    const categoryWeeklyLimit = Math.max(0, weeklyIncome - weeklySavings * 0.7);

    return {
        suggestedWeeklySavings: Number(weeklySavings.toFixed(2)),
        suggestedCategoryWeeklyLimit: Number(categoryWeeklyLimit.toFixed(2)),
    };
}
