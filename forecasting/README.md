# N2O Guardian: AI/ML package (Person 2)

Forecasts the **N2O emission rate** 30 minutes ahead (units: "reported units").
Run everything from the repo root. Data files live in `data/`.

    pip install -r forecasting/requirements.txt
    python -m ai.train          # tunes on validation, saves models/ (never touches test)
    python -m ai.evaluation     # ONE-TIME test evaluation -> reports/ (use --force to repeat)
    python -m pytest forecasting/test_predict_parity.py -q
    python -m ai.predict        # demo forecast

Dashboard use:

    from forecasting.predict import predict
    result = predict(window_df)   # 7 rows, 5 min apart: Time + 7 sensor columns

Returns forecast, forecast_time, risk_level (normal / watch / high_risk), cutoffs,
spike_threshold and top_reasons (SHAP, grouped by sensor).

Rules: real spike = above the 85th percentile of TRAINING targets (fixed);
alert cutoffs are chosen on validation data only.
