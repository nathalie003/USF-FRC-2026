# N2O Guardian — Data Engineering Handoff

Target: `target_emission_rate_30m`, the recorded `N2O emission rate` exactly 30 minutes after each observation.

Run: `python build_dataset.py '/path/to/original.csv'` (requires pandas).

Files: `data_loader.py`, `preprocessing.py`, `features.py`, `build_dataset.py`, `cleaned_data.csv`, `train.csv`, `validation.csv`, `test.csv`, `quality_report.json`.

Train/validation/test are chronological (approximately 70%/15%/15% of complete feature rows, with 30-minute boundary purging). The training CSV includes current emission rate as an input; it is valid only if current emission rate is available at inference time. If not, exclude that column and its lags, and retrain. Drop `Time` and `target_emission_rate_30m` from feature matrix; use target only as y. Fit scaling or transformations using training data only.

Quality choices: one nonnumeric flow value becomes missing; 2,851 negative flow readings are treated as invalid (not assumed to be real negative flow); no interpolation is performed; lag features use exact timestamp joins, so gaps never become fake 5-minute intervals; incomplete examples are excluded. Review whether negative flow is meaningful under the plant's sensor conventions before finalizing this policy.

Important: the supplied CSV does not define measurement units or verify emission-rate calibration. Confirm units, sensor interpretation and dataset license from the original repository before making physical emissions claims. These data support prediction evaluation, not causal claims about aeration changes.

## Version 2: boundary protection
Training examples are removed if their 30-minute-ahead target timestamp falls on or after the first validation input timestamp. The same rule applies at the validation/test boundary. The split percentages are therefore approximate. The held-out test set must not be used for hyperparameter selection.

**Important:** Current N2O emission rate and its historical lags are included as inputs; this is only appropriate if available in the intended real-time system. Units and negative-flow conventions remain unverified.
