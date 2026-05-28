import json, sys

d = json.load(sys.stdin)
data = d.get('data', {})
print(f"Title: {data.get('title')}")
print(f"Type: {data.get('type')}")
print(f"Quality: {data.get('quality')}")
print(f"Release: {data.get('releaseDate')}")
print(f"Episodes: {len(data.get('episodes') or [])}")
print(f"WatchSources: {len(data.get('watchSources') or [])}")
for s in data.get('watchSources') or []:
    print(f"  {s.get('server')}: {s.get('url')[:60]}")
print(f"DownloadLinks: {len(data.get('downloadLinks') or [])}")
for d in data.get('downloadLinks') or []:
    print(f"  {d.get('url')[:55]}")
