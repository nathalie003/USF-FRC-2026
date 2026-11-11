"""Load and validate the original Zenodo wastewater CSV."""
import pandas as pd

NUMERIC = ['Influent flowrate','DO','NH4','NO3','N2O','Temperature','N2O emission rate']

def load_data(path):
    df = pd.read_csv(path, low_memory=False)
    required = ['Time'] + NUMERIC
    missing = set(required) - set(df.columns)
    if missing:
        raise ValueError(f'Missing required columns: {sorted(missing)}')
    df['Time'] = pd.to_datetime(df['Time'], format='%m/%d/%Y %I:%M:%S %p', errors='coerce')
    for col in NUMERIC:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    if df['Time'].isna().any():
        raise ValueError(f'{df["Time"].isna().sum()} invalid timestamps')
    if df['Time'].duplicated().any():
        raise ValueError('Duplicate timestamps require review')
    return df.sort_values('Time').reset_index(drop=True)
