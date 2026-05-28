import json, sys

with open(sys.argv[1]) as f:
    d = json.load(f)
print(json.dumps(d, indent=2)[:2000])
