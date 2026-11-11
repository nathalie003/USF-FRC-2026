"""Create past-only features and exact 30-minute future emission targets."""
import pandas as pd

SENSORS = ['Influent flowrate','DO','NH4','NO3','N2O','Temperature','N2O emission rate']

def make_features(df, horizon_minutes=30):
    df = df.sort_values('Time').copy().reset_index(drop=True)
    # Only use lags with verified timestamps: a shifted row across a gap is not a 5-minute lag.
    history = df[['Time']+SENSORS].copy()
    for steps in (1, 3, 6):
        lag = history.copy()
        lag['Time'] = lag['Time'] + pd.Timedelta(minutes=steps*5)
        lag = lag.rename(columns={c:f'{c}_lag_{steps*5}m' for c in SENSORS})
        df = df.merge(lag, on='Time', how='left', validate='one_to_one')
    future = history[['Time','N2O emission rate']].copy()
    future['Time'] = future['Time'] - pd.Timedelta(minutes=horizon_minutes)
    future = future.rename(columns={'N2O emission rate':'target_emission_rate_30m'})
    df = df.merge(future, on='Time', how='left', validate='one_to_one')
    df = df.dropna(subset=['target_emission_rate_30m'])
    return df.reset_index(drop=True)
