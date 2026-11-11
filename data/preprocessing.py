"""Apply documented quality rules without imputing unknown measurements."""
import pandas as pd

SENSORS = ['Influent flowrate','DO','NH4','NO3','N2O','Temperature','N2O emission rate']

def clean_data(df):
    df = df.copy()
    # Negative physical quantities are flagged as invalid, not silently clipped.
    for col in SENSORS:
        df.loc[df[col] < 0, col] = float('nan')
    return df

def time_split(df, train_fraction=0.70, validation_fraction=0.15):
    if not 0 < train_fraction < 1 or not 0 < validation_fraction < 1 - train_fraction:
        raise ValueError('Invalid split fractions')
    df = df.sort_values('Time').reset_index(drop=True)
    a, b = int(len(df)*train_fraction), int(len(df)*(train_fraction+validation_fraction))
    train, validation, test = df.iloc[:a].copy(), df.iloc[a:b].copy(), df.iloc[b:].copy()
    # Purge boundary rows whose 30-minute targets reach into the next partition.
    # This avoids training labels being observed during the validation period.
    horizon = pd.Timedelta(minutes=30)
    train = train.loc[train['Time'] + horizon < validation['Time'].min()].copy()
    validation = validation.loc[validation['Time'] + horizon < test['Time'].min()].copy()
    return train, validation, test
