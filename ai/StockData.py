# Load and serve stock predictions from the pipeline output

import math
import pandas as pd
import glob


def load_predictions():
    """Load latest predictions from pipeline (after model training)"""
    files = glob.glob('save/predictions_*.csv') or glob.glob('save/stocks_clean_complete_*.csv')
    if not files:
        return None

    latest_file = sorted(files, reverse=True)[0]
    try:
        return pd.read_csv(latest_file)
    except Exception:
        return None


def get_top_stocks(limit=10):
    """Get top predicted stocks from pipeline model predictions"""
    df = load_predictions()
    if df is None or df.empty:
        return None

    df = df[df['close'] > 9]
    df = df[df['volume'] > 2]
    if df.empty:
        return None

    if 'predicted_close' in df.columns and 'close' in df.columns:
        df = df.copy()
        df['predicted_gain'] = ((df['predicted_close'] - df['close']) / df['close'] * 100)
        df = df[df['predicted_gain'].apply(lambda x: math.isfinite(x))]
        top = df.nlargest(limit, 'predicted_gain')
    else:
        top = df.nlargest(limit, 'volume')

    results = []
    for _, row in top.iterrows():
        entry = {
            "symbol": row['ticker'],
            "name": row.get('company_name', row['ticker']),
            "sector": row.get('industry', ''),
            "exchange": row.get('exchange', ''),
            "close": round(float(row['close']), 4) if pd.notna(row.get('close')) else 0,
            "volume": int(row['volume']) if pd.notna(row.get('volume')) else 0,
        }
        if 'predicted_close' in row and pd.notna(row['predicted_close']):
            entry["predicted_close"] = round(float(row['predicted_close']), 4)
        if 'predicted_gain' in row and pd.notna(row['predicted_gain']):
            entry["predicted_gain_pct"] = round(float(row['predicted_gain']), 2)
        results.append(entry)

    return results if results else None


def get_all_stocks():
    """Return all stocks from the latest pipeline run"""
    df = load_predictions()
    if df is None or df.empty:
        return None

    results = []
    for _, row in df.iterrows():
        entry = {
            "symbol": row['ticker'],
            "name": row.get('company_name', row['ticker']),
            "sector": row.get('industry', ''),
            "exchange": row.get('exchange', ''),
            "close": round(float(row['close']), 4) if pd.notna(row.get('close')) else 0,
            "volume": int(row['volume']) if pd.notna(row.get('volume')) else 0,
        }
        if 'predicted_close' in row and pd.notna(row['predicted_close']):
            entry["predicted_close"] = round(float(row['predicted_close']), 4)
        if 'predicted_change' in row and pd.notna(row['predicted_change']):
            entry["predicted_change"] = round(float(row['predicted_change']), 4)
        results.append(entry)

    return results
