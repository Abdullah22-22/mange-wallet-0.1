from flask import Flask, jsonify, request
from Class import AIAnalysis, SavingsPlan, PotentialSavings, BudgetWarning, SpendingCategory
from Advisor import get_savings_advice, get_top_investments
from StockData import get_top_stocks, get_all_stocks
from investing import run_stock_pipeline
import sys
import glob
import threading
import time
from datetime import datetime, timezone, timedelta

app = Flask(__name__)

import math
from flask.json.provider import DefaultJSONProvider

class SafeJSONProvider(DefaultJSONProvider):
    def dumps(self, obj, **kwargs):
        return super().dumps(self._sanitize(obj), **kwargs)
    def _sanitize(self, o):
        if isinstance(o, float) and (math.isinf(o) or math.isnan(o)):
            return None
        if isinstance(o, dict):
            return {k: self._sanitize(v) for k, v in o.items()}
        if isinstance(o, list):
            return [self._sanitize(v) for v in o]
        return o

app.json_provider_class = SafeJSONProvider
app.json = SafeJSONProvider(app)

# GMT+3 timezone
Autorunned = timezone(timedelta(hours=3))

# Default stocks — served immediately while pipeline runs in background
Hardcoded = [
    {"symbol": "MSFT", "name": "Microsoft", "sector": "Technology"},
    {"symbol": "AAPL", "name": "Apple", "sector": "Technology"},
    {"symbol": "NVDA", "name": "NVIDIA", "sector": "Technology"},
    {"symbol": "GOOGL", "name": "Google", "sector": "Technology"},
    {"symbol": "BRK.B", "name": "Berkshire Hathaway", "sector": "Financial Services"},
    {"symbol": "JNJ", "name": "Johnson & Johnson", "sector": "Healthcare"},
    {"symbol": "V", "name": "Visa", "sector": "Financial Services"},
    {"symbol": "MA", "name": "Mastercard", "sector": "Financial Services"},
    {"symbol": "PG", "name": "Procter & Gamble", "sector": "Consumer Defensive"},
    {"symbol": "UNH", "name": "United Healthcare", "sector": "Healthcare"},
]

# Try loading existing predictions from a previous run, otherwise use defaults
exist = get_top_stocks(10)
TOP_STOCKS = exist if exist else list(Hardcoded)
loadedstock = exist is None
RunLast = None


def pipeline():
    """Run full pipeline then load predicted stocks into memory"""
    global TOP_STOCKS, loadedstock, RunLast
    loadedstock = True

    print("Running stock pipeline...")

    try:
        pipeline_result = run_stock_pipeline()
        if pipeline_result is not None:
            print(f"Pipeline complete: {len(pipeline_result)} stocks processed")
        else:
            print("Pipeline returned no data")
    except Exception as e:
        print(f"Pipeline failed: {e}")

    # Reload predicted stocks from saved files
    stocks = get_top_stocks(10)
    if stocks:
        TOP_STOCKS = stocks
        RunLast = datetime.now(Autorunned).strftime('%Y-%m-%d %H:%M:%S GMT+3')
        print(f"Serving {len(stocks)} predicted stocks (updated {RunLast})")
    else:
        print("No predictions, keeping current stocks")

    loadedstock = False


def nightly_scheduler():
    """Run the pipeline every night at 10 PM GMT+3"""
    while True:
        now = datetime.now(Autorunned)
        # Next 10 PM today (or tomorrow if already past)
        target = now.replace(hour=22, minute=0, second=0, microsecond=0)
        if now >= target:
            target += timedelta(days=1)

        wait_seconds = (target - now).total_seconds()
        next_run = target.strftime('%Y-%m-%d %H:%M:%S GMT+3')
        print(f"Next pipeline run: {next_run} ({wait_seconds/3600:.1f}h from now)")

        time.sleep(wait_seconds)

        print(f"\nNightly pipeline triggered at {datetime.now(Autorunned).strftime('%H:%M:%S GMT+3')}")
        pipeline()


# Start initial pipeline in background thread
loader_thread = threading.Thread(target=pipeline, daemon=True)
loader_thread.start()

# Start nightly scheduler in background thread
scheduler_thread = threading.Thread(target=nightly_scheduler, daemon=True)
scheduler_thread.start()


def get_stocks():
    """Get stocks — never blocks, returns whatever is currently loaded"""
    return TOP_STOCKS if TOP_STOCKS else Hardcoded


@app.route('/', methods=['GET'])
def home():
    return jsonify({
        "status": "success",
        "message": "Financial Analysis API",
        "RunLast": RunLast,
        "endpoints": {
            "GET  /api/stocks": "Top 10 predicted stocks",
            "GET  /api/stocks/all": "All pipeline stocks",
            "GET  /api/status": "Pipeline status",
            "POST /api/analyze": "Full financial analysis",
            "POST /api/invest": "Investment recommendations",
        }
    })


@app.route('/api/status', methods=['GET'])
def pipeline_status():
    return jsonify({
        "status": "success",
        "RunLast": RunLast,
        "stocks_loaded": len(TOP_STOCKS) if TOP_STOCKS else 0,
        "loading": loadedstock,
    })


@app.route('/api/stocks', methods=['GET'])
def stocks_top():
    """GET top predicted stocks"""
    limit = request.args.get('limit', 10, type=int)
    limit = max(1, min(limit, 500))
    stocks = get_top_stocks(limit)
    if not stocks:
        stocks = get_stocks()[:limit]
    return jsonify({
        "status": "success",
        "count": len(stocks),
        "RunLast": RunLast,
        "stocks": stocks,
    })


@app.route('/api/stocks/all', methods=['GET'])
def stocks_all():
    """GET all stocks from last pipeline run"""
    all_stocks = get_all_stocks()
    if not all_stocks:
        return jsonify({"status": "error", "message": "No pipeline data available yet"}), 503

    return jsonify({
        "status": "success",
        "count": len(all_stocks),
        "RunLast": RunLast,
        "stocks": all_stocks,
    })


@app.route('/api/analyze', methods=['POST'])
def analyze_finances():
    try:
        data = request.get_json()
        required = ['monthly_income', 'fixed_expenses', 'variable_expenses', 'monthly_savings_goal']
        
        if not data or not all(f in data for f in required):
            return jsonify({"status": "error", "message": f"Missing fields: {', '.join(required)}"}), 400
        
        monthly_income = float(data['monthly_income'])
        fixed_expenses = float(data['fixed_expenses'])
        variable_expenses = float(data['variable_expenses'])
        monthly_savings_goal = float(data['monthly_savings_goal'])
        
        # Analysis
        analysis = AIAnalysis(data.get('user_id', 'anonymous'))
        analysis.savings_plans.append(SavingsPlan(monthly_income, fixed_expenses, monthly_savings_goal))
        
        total_expenses = fixed_expenses + variable_expenses
        disposable_income = monthly_income - total_expenses
        
        if disposable_income > 0:
            saving_rate = (disposable_income / monthly_income) * 100
            analysis.potential_savings = PotentialSavings(0, monthly_savings_goal, saving_rate)
        else:
            analysis.budget_warnings.append(
                BudgetWarning("Budget", disposable_income, "Immediate", abs(disposable_income))
            )
        
        for category, amount in data.get('spending_habits', {}).items():
            analysis.spending_categories[category] = SpendingCategory(category, amount)
        
        # Get advice
        savings_advice = get_savings_advice(monthly_income, disposable_income)
        investments = get_top_investments(disposable_income, get_stocks())
        
        return jsonify({
            "status": "success",
            "analysis": {
                "monthly_income": monthly_income,
                "total_expenses": total_expenses,
                "disposable_income": round(disposable_income, 2),
                "savings_rate": round((disposable_income / monthly_income * 100), 2) if monthly_income > 0 else 0,
                "budget_warnings": [{"category": w.category, "amount": w.shortfall_amount} 
                                   for w in analysis.budget_warnings]
            },
            "savings_advice": savings_advice,
            "investment_recommendations": investments
        }), 200
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid numeric values"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/invest', methods=['POST'])
def invest():
    """Investment recommendation endpoint - takes disposable income and returns stock allocation"""
    try:
        data = request.get_json()
        
        if not data or 'disposable_income' not in data:
            return jsonify({"status": "error", "message": "Missing field: disposable_income"}), 400
        
        disposable_income = float(data['disposable_income'])
        investments = get_top_investments(disposable_income, get_stocks())
        
        return jsonify({
            "status": "success",
            "investments": investments
        }), 200
    except ValueError:
        return jsonify({"status": "error", "message": "Invalid numeric value for disposable_income"}), 400
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({"status": "error", "message": "Not found"}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({"status": "error", "message": "Server error"}), 500

if __name__ == "__main__":
    print("Starting Flask API on http://localhost:5000")
    app.run(debug=True, host="localhost", port=5000)