import pandas as pd
import numpy as np

np.random.seed(42)
rows = []

def assign_label(row):
    s, r = row['score'], row['retry_count']
    if s >= 8 and r <= 1:   return 'Strong'
    elif s >= 6:             return 'Moderate'
    elif s >= 4:             return 'Weak'
    else:                    return 'Critical'

# Strong — high score, low retries, fast
for _ in range(60):
    rows.append({
        'score':               np.random.randint(8, 11),
        'accuracy':            round(np.random.uniform(0.80, 1.0), 2),
        'retry_count':         np.random.randint(0, 2),
        'time_taken':          np.random.randint(30, 90),
        'first_attempt_score': np.random.randint(7, 11),
    })

# Moderate
for _ in range(60):
    rows.append({
        'score':               np.random.randint(6, 8),
        'accuracy':            round(np.random.uniform(0.55, 0.80), 2),
        'retry_count':         np.random.randint(1, 3),
        'time_taken':          np.random.randint(90, 160),
        'first_attempt_score': np.random.randint(4, 8),
    })

# Weak
for _ in range(50):
    rows.append({
        'score':               np.random.randint(4, 6),
        'accuracy':            round(np.random.uniform(0.30, 0.55), 2),
        'retry_count':         np.random.randint(3, 5),
        'time_taken':          np.random.randint(160, 220),
        'first_attempt_score': np.random.randint(2, 5),
    })

# Critical
for _ in range(30):
    rows.append({
        'score':               np.random.randint(0, 4),
        'accuracy':            round(np.random.uniform(0.0, 0.35), 2),
        'retry_count':         np.random.randint(5, 9),
        'time_taken':          np.random.randint(200, 300),
        'first_attempt_score': np.random.randint(0, 3),
    })

df = pd.DataFrame(rows)
df['label'] = df.apply(assign_label, axis=1)
df.to_csv('training_data.csv', index=False)
print("CSV saved! Shape:", df.shape)
print(df['label'].value_counts())
