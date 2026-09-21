import csv
import json
import os

base_dir = r"d:\project_files\careerguidance\onet_31_0\db_31_0_csv"

occ_file = os.path.join(base_dir, "occupation_data.csv")
int_file = os.path.join(base_dir, "career_interest_types.csv")

occupations = {}
with open(occ_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        occupations[row['O*NET-SOC Code']] = {
            'title': row['Title'],
            'description': row['Description']
        }

riasec = {}
with open(int_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        if row['Scale ID'] == 'OI':
            soc = row['O*NET-SOC Code']
            if soc not in riasec:
                riasec[soc] = {'R': 0, 'I': 0, 'A': 0, 'S': 0, 'E': 0, 'C': 0}
            elem = row['Element Name']
            val = float(row['Data Value'])
            if elem == 'Realistic': riasec[soc]['R'] = val
            elif elem == 'Investigative': riasec[soc]['I'] = val
            elif elem == 'Artistic': riasec[soc]['A'] = val
            elif elem == 'Social': riasec[soc]['S'] = val
            elif elem == 'Enterprising': riasec[soc]['E'] = val
            elif elem == 'Conventional': riasec[soc]['C'] = val

merged = {}
for soc, info in occupations.items():
    if soc in riasec:
        merged[soc] = {
            'title': info['title'],
            'description': info['description'],
            'riasec': riasec[soc]
        }

out_file = r"d:\project_files\careerguidance\scripts\onet_parsed.json"
with open(out_file, 'w', encoding='utf-8') as f:
    json.dump(merged, f, indent=2)

print(f"Successfully generated {out_file} with {len(merged)} O*NET occupations!")
