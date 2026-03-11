# Financial Analysis Classes
class SavingsPlan:
    def __init__(self, monthly_income: float, fixed_expenses: float, monthly_savings_goal: float):
        self.monthly_income = monthly_income
        self.fixed_expenses = fixed_expenses
        self.monthly_savings_goal = monthly_savings_goal


class BudgetWarning:
    def __init__(self, category: str, est_balance: float, target_date: str, shortfall_amount: float = None):
        self.category = category
        self.est_balance = est_balance
        self.target_date = target_date
        self.shortfall_amount = shortfall_amount


class PotentialSavings:
    def __init__(self, current_amount: float, target_amount: float, saving_rate_percentage: float):
        self.current_amount = current_amount
        self.target_amount = target_amount
        self.saving_rate_percentage = saving_rate_percentage


class SpendingCategory:
    def __init__(self, category_name: str, estimated_spending: float, limit: float = None):
        self.category_name = category_name
        self.estimated_spending = estimated_spending
        self.limit = limit


class AIAnalysis:
    def __init__(self, user_id: str):
        self.user_id = user_id
        self.savings_plans = []
        self.budget_warnings = []
        self.potential_savings = None
        self.spending_categories = {}