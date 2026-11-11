# N₂O Guardian: model results (N₂O emission rate, 30 min ahead)
All values are in **reported units** (the dataset does not define units).

## Average error (lower is better)
| Split | Model MAE | 'Same as now' MAE | Model RMSE | 'Same as now' RMSE |
|---|---|---|---|---|
| Validation | 0.0896 | 0.1171 | 0.2488 | 0.3251 |
| Test | 0.1986 | 0.2494 | 0.4075 | 0.4273 |

## Spike alerts on the test data (real spike = above 0.530, top 15% of training)
Test period contains 1586 real-spike rows (15.5% of rows).
| Alert level | Cutoff | Spikes caught | Spikes missed | False alarms | Precision | Recall |
|---|---|---|---|---|---|---|
| Watch | 0.187 | 1313 | 273 | 2360 | 0.36 | 0.83 |
| High risk | 0.380 | 844 | 742 | 564 | 0.60 | 0.53 |
| High risk, 'same as now' guess | 0.380 | 898 | 688 | 1490 | 0.38 | 0.57 |

Spike ranking quality (PR-AUC, higher is better): model 0.585 vs 'same as now' 0.441.

## Honest answer to "what if the plant has no live N₂O sensor?"
Without any N₂O or emission-rate inputs the test MAE is 0.2507 and RMSE 0.5652, versus 0.1986 / 0.4075 with them.

## Caveats
- One plant, one 8-month period; spike frequency differed between seasons.
- Units and negative-flow conventions are unverified.
- Forecasts come from historical data; they say nothing about the effect of changing aeration.