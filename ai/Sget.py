import pandas as pd
import yfinance as yf
import time
from datetime import datetime


def clean_and_download_stocks(csv_file):
    df = pd.read_csv(csv_file)
    tickers = df['ticker'].tolist()
    
    print(f"Processing {len(tickers)} stocks...\n")
    
    all_clean_data = []
    failed_tickers = []
    
    for i in range(0, len(tickers), 50):
        batch = tickers[i:i + 50]
        
        try:
            data = yf.download(batch, period="1d", group_by='ticker', timeout=60)
            
            for ticker in batch:
                if ticker in data and not data[ticker].empty:
                    row = data[ticker].iloc[-1]
                    company_info = df[df['ticker'] == ticker].iloc[0]
                    
                    clean_record = clean_stock_data(ticker, row, data[ticker].index[-1], company_info)
                    if clean_record:
                        all_clean_data.append(clean_record)
                    else:
                        failed_tickers.append(ticker)
                else:
                    failed_tickers.append(ticker)
            
            print(f"Batch {i//50 + 1}: {len([t for t in batch if t in data])}/{len(batch)} successful")
                        
        except Exception as e:
            print(f"Batch failed: {e}")
            failed_tickers.extend(batch)
        
        print("Waiting 15s...")
        time.sleep(15)
    
    print(f"Done: {len(all_clean_data)} successful | {len(failed_tickers)} failed")
    return all_clean_data, failed_tickers


def clean_stock_data(ticker, row, date, company_info):
    try:
        open_price = row['Open'] if pd.notna(row['Open']) else 0
        high_price = row['High'] if pd.notna(row['High']) else 0
        low_price = row['Low'] if pd.notna(row['Low']) else 0
        close_price = row['Close'] if pd.notna(row['Close']) else 0
        volume = row['Volume'] if pd.notna(row['Volume']) else 0
        
        price_change = close_price - open_price
        price_change_pct = (price_change / open_price * 100) if open_price > 0 else 0
        daily_range = high_price - low_price
        range_pct = (daily_range / close_price * 100) if close_price > 0 else 0
        
        return {
            'ticker': ticker,
            'company_name': str(company_info.get('company name', '')).strip(),
            'industry': str(company_info.get('industry', '')).strip(),
            'exchange': str(company_info.get('exchange', '')).strip(),
            'date': date.strftime('%Y-%m-%d'),
            'open': round(open_price, 4),
            'high': round(high_price, 4),
            'low': round(low_price, 4),
            'close': round(close_price, 4),
            'volume': int(volume),
            'price_change': round(price_change, 4),
            'price_change_pct': round(price_change_pct, 2),
            'daily_range': round(daily_range, 4),
            'range_pct': round(range_pct, 2),
            'has_zero_volume': volume == 0,
            'has_zero_price': close_price == 0,
            'is_etf': any(kw in str(company_info.get('company name', '')).upper() for kw in ['ETF', 'FUND', 'TRUST']),
            'download_timestamp': datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
            'data_quality': 'GOOD' if all([open_price > 0, volume > 0]) else 'CHECK'
        }
    except:
        return None
