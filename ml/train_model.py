import pandas as pd
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Load CSV — it's in the same folder
df = pd.read_csv('training_data.csv')

features = ['score', 'accuracy', 'retry_count', 'time_taken', 'first_attempt_score']
X = df[features]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = DecisionTreeClassifier(max_depth=5, random_state=42)
model.fit(X_train, y_train)

predictions = model.predict(X_test)
print("Accuracy:", accuracy_score(y_test, predictions))
print(classification_report(y_test, predictions))

# Save model — stays in ml/ folder
joblib.dump(model, 'model.pkl')
print("model.pkl saved!")
