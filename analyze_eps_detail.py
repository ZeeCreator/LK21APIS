import re, sys

filepath = sys.argv[1]
with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Download links
for m in re.finditer(r'gmr-download-wrap.*?gmr-download-list.*?</ul>', content, re.DOTALL):
    for m2 in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', m.group(0), re.DOTALL):
        txt = re.sub(r'<[^>]+>', '', m2.group(2)).strip()
        print(f"Download: {txt[:30]:30s} {m2.group(1)[:60]}")

print("--- Server Tabs ---")
for m in re.finditer(r'muvipro-player-tabs.*?</ul>', content, re.DOTALL):
    for m2 in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', m.group(0), re.DOTALL):
        txt = re.sub(r'<[^>]+>', '', m2.group(2)).strip()
        if txt:
            print(f"Tab: {txt:20s} {m2.group(1)[:80]}")

print("--- Embed iframes ---")
for m in re.finditer(r'gmr-embed-responsive.*?</div>', content, re.DOTALL):
    for m2 in re.finditer(r'<iframe[^>]+src="([^"]+)"', m.group(0)):
        print(f"Embed iframe: {m2.group(1)[:80]}")

print("--- Main article ---")
m = re.search(r'<article[^>]*>(.*?)</article>', content, re.DOTALL)
if m:
    art = m.group(1)
    # Get description
    m2 = re.search(r'<p>(.{50,200})</p>', art)
    if m2:
        txt = re.sub(r'<[^>]+>', '', m2.group(1)).strip()
        print(f"Description: {txt[:100]}")
    # Get poster
    m2 = re.search(r'<img[^>]*src="([^"]+)"[^>]*class="[^"]*attachment-thumbnail[^"]*"', art)
    if m2:
        print(f"Poster: {m2.group(1)[:80]}")

# Movie data
print("\n--- Movie data ---")
for m in re.finditer(r'content-moviedata.*?</div>\s*</div>', content, re.DOTALL):
    for m2 in re.finditer(r'gmr-moviedata[^>]*>(.*?)</div>', m.group(0)):
        txt = re.sub(r'<[^>]+>', '', m2.group(1)).strip()
        if txt:
            print(f"  {txt[:80]}")

# Check for season/episode info
for m in re.finditer(r'S(\d+)\s*Eps(\d+)', content):
    print(f"Season/Episode: {m.group(0)}")
