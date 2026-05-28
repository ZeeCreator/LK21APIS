import urllib.request, json, time

BASE = "http://localhost:3000/api/v1"

def req(path):
    try:
        r = urllib.request.urlopen(BASE + path, timeout=30)
        return json.loads(r.read())
    except Exception as e:
        return {"error": str(e)}

def section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

# 1. Movies - Detail
section("1. MOVIE DETAIL")
d = req("/movies/the-presidents-cake-2025")
data = d.get('data', {})
print(f"  title:       {data.get('title')}")
print(f"  type:        {data.get('type')}")
print(f"  genres:      {data.get('genres')}")
print(f"  rating:      {data.get('rating')}")
print(f"  quality:     {data.get('quality')}")
print(f"  duration:    {data.get('duration')}")
print(f"  year:        {data.get('year')}")
print(f"  country:     {data.get('country')}")
ws = data.get('watchSources', [])
print(f"  watchSrcs:   {len(ws)}")
for s in ws[:3]:
    print(f"    {s.get('server')}: {s.get('url')[:60]}")
dl = data.get('downloadLinks', [])
print(f"  downloads:   {len(dl)}")

# 2. Watch - Default
section("2. WATCH - Default")
d = req("/watch/the-presidents-cake-2025")
data = d.get('data', [])
print(f"  sources: {len(data)}")
for s in data:
    print(f"    {s.get('server')}: {s.get('url')[:60]}")

# 3. Watch - With Resolve
section("3. WATCH - With Resolve")
d = req("/watch/the-presidents-cake-2025?resolve=true")
data = d.get('data', [])
print(f"  sources: {len(data)}")
for s in data[:4]:
    print(f"    {s.get('server')}: type={s.get('streamType')} url={s.get('url')[:50]}")

# 4. Download
section("4. DOWNLOAD")
d = req("/download/the-presidents-cake-2025")
data = d.get('data', [])
print(f"  links: {len(data)}")
for l in data:
    print(f"    {l.get('url')[:70]}")

# 5. Search
section("5. SEARCH")
d = req("/search/?q=president")
print(f"  type: {type(d).__name__}")
if isinstance(d, dict) and 'data' in d:
    movies = d['data']
    if isinstance(movies, dict):
        movies = movies.get('movies', [])
    print(f"  results: {len(movies)}")
    for m in movies[:3]:
        print(f"    {m.get('title')} ({m.get('type')})")

# 6. Latest Movies
section("6. LATEST MOVIES")
d = req("/movies/latest")
data = d.get('data', d) if isinstance(d, dict) else d
movies = data.get('movies', data) if isinstance(data, dict) else data
print(f"  movies: {len(movies)}")
for m in movies[:5]:
    print(f"    {m.get('title')} ({m.get('type')})")

# 7. Genres
section("7. GENRES")
d = req("/genres/")
data = d.get('data', d) if isinstance(d, dict) else d
print(f"  genres: {len(data)}")
print(f"  {[g.get('name') for g in data[:7]]}")

# 8. Country
section("8. COUNTRY")
d = req("/country/")
data = d.get('data', d) if isinstance(d, dict) else d
print(f"  countries: {len(data)}")
print(f"  {[c.get('name') for c in data[:7]]}")

# 9. urlextract
section("9. URLEXTRACT")
payload = json.dumps({"url": "https://voe.sx/e/ch9msrxkdc8j"}).encode()
r = urllib.request.Request(BASE + "/urlextract/", data=payload, headers={"Content-Type": "application/json"})
try:
    d = json.loads(urllib.request.urlopen(r, timeout=20).read())
    print(f"  url:  {d.get('data',{}).get('url','?')[:50]}")
    print(f"  type: {d.get('data',{}).get('type','?')}")
except Exception as e:
    print(f"  ERROR: {e}")

# 10. TV Series
section("10. TV SERIES DETAIL")
d = req("/movies/a-good-girls-guide-to-murder-season-2-2026")
data = d.get('data', {})
print(f"  title:        {data.get('title')}")
print(f"  type:         {data.get('type')}")
print(f"  episodeCount: {data.get('episodeCount')}")
eps = data.get('episodes', [])
print(f"  episodes:     {len(eps)}")
for e in eps[:3]:
    print(f"    {e.get('episode')}")

# 11. Test page HTML output
section("11. TESTSTREAM PAGE")
r = urllib.request.urlopen(BASE + "/teststream/?slug=the-presidents-cake-2025", timeout=30)
html = r.read().decode()
print(f"  status: {r.status}")
print(f"  length: {len(html)} bytes")
print(f"  has tab-bar: {'tab-bar' in html}")
print(f"  has iframe: {'<iframe' in html}")
print(f"  has Popout: {'Popout' in html}")
print(f"  has Reload: {'Reload' in html}")

print(f"\n{'='*60}")
print(f"  ALL TESTS COMPLETE")
print(f"{'='*60}")
