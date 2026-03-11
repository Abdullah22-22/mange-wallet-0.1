import pandas as pd
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
import pickle, os

SAVE_DIR = 'save/'
MODEL_DIR = 'save/models/'
FEATURES = ['open', 'high', 'low', 'volume', 'price_change', 'daily_range', 'range_pct']


def enhance_final_data(df):
    """Clean up duplicates and tag each stock by size/performance."""
    df = df.drop_duplicates(subset=['ticker'], keep='first')
    df = df.sort_values(['volume', 'ticker'], ascending=[False, True])

   
    try:
        df['size_category'] = pd.qcut(df['volume'], q=3,
       labels=['Small', 'Medium', 'Large'], duplicates='drop')
    except Exception:
        df['size_category'] = 'Medium'

    # bucket by price change
    df['performance'] = pd.cut(
        df['price_change_pct'],
        bins=[-float('inf'), -5, -1, 1, 5, float('inf')],
        labels=['Big Loss', 'Small Loss', 'Neutral', 'Small Gain', 'Big Gain']
    )
    return df


def save_final_datasets(clean_df, failed_tickers):
    """Write several CSV snapshots: full, analysis-ready, top-500, and a summary."""
    ts = datetime.now().strftime('%Y%m%d_%H%M')

    # 1) everything
    clean_df.to_csv(f'{SAVE_DIR}stocks_clean_complete_{ts}.csv', index=False)

    # 2) only rows with real volume/price
    good = clean_df.query('has_zero_volume == False and has_zero_price == False and volume > 1000')
    good.to_csv(f'{SAVE_DIR}stocks_clean_analysis_{ts}.csv', index=False)

    # 3) top 500 by volume (just the key columns)
    cols = ['ticker', 'company_name', 'close', 'price_change_pct', 'volume', 'exchange']
    clean_df.nlargest(500, 'volume')[cols].to_csv(
        f'{SAVE_DIR}stocks_clean_showcase_{ts}.csv', index=False)

    total = len(clean_df) + len(failed_tickers)
    if total > 0:
        pd.DataFrame([{
            'total': total,
            'successful': len(clean_df),
            'failed': len(failed_tickers),
            'success_rate': round(len(clean_df) / total * 100, 1),
            'avg_volume': clean_df['volume'].mean(),
            'avg_change_pct': clean_df['price_change_pct'].mean(),
            'timestamp': ts,
        }]).to_csv(f'{SAVE_DIR}stocks_summary_{ts}.csv', index=False)


def print_summary(clean_df, failed_tickers, total_tickers):
    """Print a quick recap to the console."""
    ok, fail = len(clean_df), len(failed_tickers)
    pct = round(ok / total_tickers * 100, 1) if total_tickers else 0

    print(f"\n{'='*50}")
    print(f"COMPLETED  —  {ok} ok / {fail} failed  ({pct}%)")
    print(f"{'='*50}")

    print(f"  Zero volume: {clean_df['has_zero_volume'].sum()}")
    print(f"  Zero price:  {clean_df['has_zero_price'].sum()}")
    print(f"  ETFs:        {clean_df['is_etf'].sum()}")

    ch = clean_df['price_change_pct']
    print(f"\n  Avg change: {ch.mean():.2f}%   "
          f"Best: {ch.max():.2f}%   Worst: {ch.min():.2f}%")
    print(f"  Total volume: {int(clean_df['volume'].sum())}")
    print(f"  Files saved to {SAVE_DIR}\n{'='*50}")


def check_accuracy(pred_df, actual_df):
    """Compare predicted vs actual close prices, return merged df with error %."""
    if pred_df.empty or actual_df.empty:
        return None

    actual = actual_df.rename(columns={'close': 'actual_close'})
    merged = pred_df.merge(actual[['ticker', 'actual_close']], on='ticker', how='inner')
    if merged.empty:
        return None

    merged['error_pct'] = (
        abs(merged['predicted_close'] - merged['actual_close'])
        / merged['actual_close'] * 100
    )
    print(f"Accuracy: {len(merged)} matched | Avg Error: {merged['error_pct'].mean():.2f}%")
    return merged


def load_latest_models():
    """Try to load previously saved models from disk."""
    if not os.path.exists(MODEL_DIR):
        return None, None, None
    try:
        models, scalers = {}, {}
        for kind in ['Stock', 'ETF']:
            with open(f'{MODEL_DIR}model_{kind}.pkl', 'rb') as f:
                models[kind] = pickle.load(f)
            with open(f'{MODEL_DIR}scaler_{kind}.pkl', 'rb') as f:
                scalers[kind] = pickle.load(f)
        with open(f'{MODEL_DIR}features.pkl', 'rb') as f:
            features = pickle.load(f)
        print("Loaded saved models")
        return models, scalers, features
    except Exception:
        return None, None, None


def build_improved_prediction_model(data_df, save_trained=True):
    """Train a RandomForest for stocks and another for ETFs, then save them."""
    data = data_df[FEATURES + ['close', 'is_etf']].dropna()
    data = data[(data['close'] > 0) & (data['volume'] > 0)]

    models, scalers = {}, {}

    for is_etf, label in [(True, 'ETF'), (False, 'Stock')]:
        subset = data[data['is_etf'] == is_etf]
        if len(subset) < 10:
            continue

        X, y = subset[FEATURES].values, subset['close'].values
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        model = RandomForestRegressor(n_estimators=50, max_depth=10, random_state=42)
        model.fit(X_scaled, y)

        models[label] = model
        scalers[label] = scaler
        print(f"Trained {label} model ({len(subset)} samples)")

    if save_trained and models:
        os.makedirs(MODEL_DIR, exist_ok=True)
        for label in models:
            with open(f'{MODEL_DIR}model_{label}.pkl', 'wb') as f:
                pickle.dump(models[label], f)
            with open(f'{MODEL_DIR}scaler_{label}.pkl', 'wb') as f:
                pickle.dump(scalers[label], f)
        with open(f'{MODEL_DIR}features.pkl', 'wb') as f:
            pickle.dump(FEATURES, f)

    return models, scalers, FEATURES


def predict_prices_improved(data_df, models, scalers, features):
    """Run each model on its slice of data and return a predictions DataFrame."""
    if not models or not scalers:
        return pd.DataFrame()

    results = []
    for label, is_etf in [('ETF', True), ('Stock', False)]:
        if label not in models:
            continue
        subset = data_df[data_df['is_etf'] == is_etf]
        if subset.empty:
            continue

        preds = models[label].predict(scalers[label].transform(subset[features].values))

        for idx, pred in zip(subset.index, preds):
            cur = subset.loc[idx, 'close']
            pred = max(pred, 0.01)
            results.append({
                'ticker': subset.loc[idx, 'ticker'],
                'predicted_close': round(pred, 4),
                'predicted_change': round(pred - cur, 4),
            })

    return pd.DataFrame(results)
