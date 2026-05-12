import csv

with open('scripts/rate.csv', mode='r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    data = list(reader)

# Convert MRP to float and filter out zeros
valid_data = []
for row in data:
    try:
        mrp = float(row['MRP'])
        if mrp > 0:
            row['MRP_float'] = mrp
            valid_data.append(row)
    except:
        continue

# Sort by price
sorted_data = sorted(valid_data, key=lambda x: x['MRP_float'])

print("Top 10 Cheapest Medicines (Jan Aushadhi Prices):")
for i, x in enumerate(sorted_data[:10]):
    price_per_unit = x['MRP_float']
    unit_desc = x['Unit Size']
    # Try to calculate price per tablet if unit size is like "10's"
    per_tablet = ""
    if "'s" in unit_desc:
        try:
            count = int(unit_desc.replace("'s", ""))
            per_tablet = f" (~Rs {price_per_unit/count:.4f} per tablet)"
        except:
            pass
            
    print(f"{i+1}. {x['Generic Name']} - Rs {x['MRP']} for {unit_desc}{per_tablet}")
