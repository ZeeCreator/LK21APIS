import json, sys

with open(sys.argv[1]) as f:
    d = json.load(f)
data = d.get('data', [])
if isinstance(data, dict):
    data = data if 'movies' not in data else data.get('movies', [])
print(f"Total: {len(data)}")
if data:
    print(f"First: {data[0].get('title','?')}")
    print(f"Type:  {data[0].get('type','?')}")
tv_items = [m for m in data if m.get('type')=='tv']
print(f"TV items: {len(tv_items)}")
print(f"Movie items: {len(data)-len(tv_items)}")
