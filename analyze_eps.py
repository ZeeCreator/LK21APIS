import re, sys

filepath = sys.argv[1]
with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
    content = f.read()

# Find episode links from gmr-listseries
for m in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*class="gmr-listseries-link"[^>]*>(.*?)</a>', content, re.DOTALL):
    print(f"  {m.group(2).strip():30s} {m.group(1)}")

print("---")

# Alternative: find all links within gmr-listseries
m = re.search(r'<div class="gmr-listseries">(.*?)</div>', content, re.DOTALL)
if m:
    section = m.group(1)
    for m2 in re.finditer(r'<a[^>]*href="([^"]+)"[^>]*>(.*?)</a>', section, re.DOTALL):
        title = m2.group(2).strip()
        title = re.sub(r'<[^>]+>', '', title)
        if title:
            print(f"  {title:30s} {m2.group(1)}")
