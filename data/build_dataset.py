"""Usage: python build_dataset.py /path/to/raw.csv"""
import sys, json
from pathlib import Path
from data_loader import load_data
from preprocessing import clean_data, time_split
from features import make_features

def main(raw_path):
    out = Path(__file__).resolve().parent
    raw = load_data(raw_path)
    report = {'raw_rows':len(raw),'raw_missing_numeric':raw.select_dtypes('number').isna().sum().to_dict(),
              'negative_values':{c:int((raw[c]<0).sum()) for c in raw.select_dtypes('number').columns},
              'timestamp_gaps_over_5min':int((raw.Time.diff()>__import__('pandas').Timedelta(minutes=5)).sum())}
    clean = clean_data(raw)
    clean.to_csv(out/'cleaned_data.csv',index=False)
    features = make_features(clean)
    # Conservative complete-case policy: no model inputs are imputed from future values.
    features = features.dropna().reset_index(drop=True)
    train,val,test = time_split(features)
    report['purged_boundary_rows'] = len(features) - len(train) - len(val) - len(test)
    for name,part in [('train',train),('validation',val),('test',test)]:
        part.to_csv(out/f'{name}.csv',index=False)
        report[f'{name}_rows'] = len(part)
        report[f'{name}_first_time'] = str(part.Time.min())
        report[f'{name}_last_time'] = str(part.Time.max())
    report['usable_feature_rows']=len(features)
    (out/'quality_report.json').write_text(json.dumps(report,indent=2))
    print(json.dumps(report,indent=2))

if __name__=='__main__':
    if len(sys.argv)!=2:
        raise SystemExit('Usage: python build_dataset.py /path/to/raw.csv')
    main(sys.argv[1])
