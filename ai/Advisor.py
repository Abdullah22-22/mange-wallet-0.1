# Financial Advisor - Savings and Investment Recommendations

# Constants
SAVINGS_THRESHOLDS = [
    (10, "Low savings rate. Try to save more aggressively.", "Cut back on non-essential spending"),
    (20, "Moderate savings rate. Good start, but aim higher.", "Increase savings by 5% and invest the difference"),
    (30, "Good savings rate! You're on track.", "Diversify: 70% to savings, 30% to investments"),
    (float('inf'), "Excellent savings rate! You're ahead of the game.", "Consider aggressive investments for wealth building")
]

COMMON_TIPS = [
    "Automate your savings - set up automatic transfers",
    "Use the 50/30/20 rule: 50% needs, 30% wants, 20% savings",
    "Track spending monthly to identify areas to cut",
    "Build emergency fund before aggressive investing",
    "Contribute to retirement accounts (401k, IRA) first"
]

def get_savings_advice(monthly_income, disposable_income):
    """Generate personalized savings advice"""
    if disposable_income <= 0:
        return {
            "status": "warning",
            "message": "Your expenses exceed income. Focus on reducing spending.",
            "daily_savings_tip": "Cut one subscription you don't use - could save $10-50/month instantly",
            "tips": ["Review subscriptions", "Cut discretionary spending", "Increase income", "Create strict budget"]
        }
    
    savings_rate = round((disposable_income / monthly_income) * 100, 2)
    message, action = next(((m, a) for t, m, a in SAVINGS_THRESHOLDS if savings_rate < t), (None, None))
    
    return {
        "status": "success",
        "current_savings_rate": savings_rate,
        "monthly_disposable": round(disposable_income, 2),
        "message": message,
        "action_plan": action,
        "recommended_allocation": {
            "emergency_fund": "3-6 months of expenses",
            "savings": round(disposable_income * 0.5, 2),
            "investments": round(disposable_income * 0.3, 2),
            "short_term": round(disposable_income * 0.2, 2)
        },
        "tips": COMMON_TIPS
    }

INVESTMENT_TIPS = [
    "Use dollar-cost averaging to reduce market timing risk",
    "Diversify across sectors: Tech, Finance, Healthcare, Consumer",
    "Reinvest dividends for compound growth",
    "Review portfolio quarterly and rebalance annually",
    "Consider low-fee brokerages (Fidelity, Vanguard, Schwab)"
]

def get_top_investments(disposable_income, companies):
    """Generate investment recommendations for top 10 companies"""
    if disposable_income <= 0:
        return {"status": "not_eligible", "message": "You need positive disposable income to invest", "recommendations": []}
    
    per_company = round(disposable_income / 10, 2)
    recommendations = [
        {
            "rank": i,
            "symbol": c["symbol"],
            "name": c["name"],
            "sector": c["sector"],
            "monthly_investment": per_company,
            "annual_investment": round(per_company * 12, 2)
        }
        for i, c in enumerate(companies, 1)
    ]
    
    return {
        "status": "success",
        "message": "Top 10 blue-chip companies for long-term growth",
        "total_monthly_investment": round(disposable_income, 2),
        "allocation_per_company": per_company,
        "recommendations": recommendations,
        "daily_savings_tip": f"Invest ${per_company}/month per company - small amounts compound into big wealth",
        "investment_tips": INVESTMENT_TIPS,
        "disclaimer": "Investment recommendations are for informational purposes only and not financial advice. Always do your own research."
        
    }
