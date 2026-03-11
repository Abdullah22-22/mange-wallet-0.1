"""
Stock Data Pipeline
Downloads stock data, cleans it, enhances it, trains model, predicts, and saves for API use
"""
import time
from datetime import datetime
from Sget import clean_and_download_stocks
from Strain import enhance_final_data, save_final_datasets, print_summary, build_improved_prediction_model, predict_prices_improved
import pandas as pd

COMPANIES_CSV = 'save/companies.csv'

def run_stock_pipeline():
    """Main pipeline: Download -> Clean -> Enhance -> Train -> Predict -> Save"""
    print(f"Pipeline started at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    try:
        all_data, failed = clean_and_download_stocks(COMPANIES_CSV)
        print(f"Downloaded: {len(all_data)} | Failed: {len(failed)}")
    except Exception as e:
        print(f"Download failed: {e}")
        return None
    
    if not all_data:
        print("No data downloaded")
        return None
    
    try:
        df = pd.DataFrame(all_data)
        df = enhance_final_data(df)
        print(f"Enhanced: {len(df)} records")
    except Exception as e:
        print(f"Enhancement failed: {e}")
        return None
    
    try:
        models, scalers, features = build_improved_prediction_model(df, save_trained=True)
        if models:
            predictions = predict_prices_improved(df, models, scalers, features)
            if not predictions.empty:
                df = df.merge(predictions, on='ticker', how='left')
                print(f"Predicted prices for {len(predictions)} stocks")
            else:
                print("No predictions generated")
        else:
            print("Could not train model")
    except Exception as e:
        print(f"Prediction step failed: {e}")
    
    try:
        save_final_datasets(df, failed)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        df.to_csv(f'save/predictions_{timestamp}.csv', index=False)
        print(f"Saved to save/ folder")
    except Exception as e:
        print(f"Save failed: {e}")
        return None
    
    print_summary(df, failed, len(all_data) + len(failed))

    
    return df

if __name__ == "__main__":
    run_stock_pipeline()

