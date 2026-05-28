import re
import sys

filepath = sys.argv[1]

with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

print("Title:", re.search(r'<title>(.*?)</title>', content, re.DOTALL))

for m in re.finditer(r'<h1[^>]*>(.*?)</h1>', content, re.DOTALL):
    t = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    if t:
        print("H1:", t)

m = re.search(r'<link rel="canonical"[^>]*href="([^"]+)"', content)
print("Canonical:", m.group(1) if m else "NOT FOUND")

iframes = re.findall(r'<iframe[^>]+src="([^"]+)"', content)
print(f"Iframes: {len(iframes)}")
for u in iframes[:3]:
    print(f"  {u[:80]}")

print(f"Embed containers: {len(re.findall(r'gmr-embed-responsive', content))}")
print(f"Server tabs: {len(re.findall(r'muvipro-player-tabs', content))}")

m = re.search(r'<article[^>]*class="([^"]+)"', content)
print(f"Article class: {m.group(1) if m else 'NOT FOUND'}")

posttypes = re.findall(r'gmr-posttype-item[^>]*>([^<]+)', content)
print(f"Post types: {posttypes}")

# Check season/episode info
eps = re.findall(r'gmr-numbeps[^>]*>([^<]+)', content)
print(f"Episode count: {eps}")

series = re.findall(r'gmr-listseries', content)
print(f"Episode list: {len(series)}")

# Check download section
dl = len(re.findall(r'gmr-download-wrap', content))
print(f"Download section: {dl}")

# Look for movie data
for m in re.finditer(r'gmr-moviedata[^>]*>([^<]+)', content):
    txt = re.sub(r'<[^>]+>', '', m.group(1)).strip()
    if txt:
        print(f"Movie data: {txt[:100]}")

# Check what page structure this is
if '/tv/' in content:
    print("Page type: TV show page")
elif '/movie/' in content:
    print("Page type: Movie page")
else:
    print("Page type: Unknown - likely episode/page post")
