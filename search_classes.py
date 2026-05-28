import re
with open('search_page.html', 'r', encoding='utf-8') as f:
    html = f.read()
classes = set()
for m in re.finditer(r'class="([^"]+)"', html):
    for c in m.group(1).split():
        classes.add(c)
relevant = [c for c in sorted(classes) if any(k in c.lower() for k in ['item', 'post', 'movie', 'film', 'entry', 'title', 'thumb', 'image', 'content', 'module', 'grid', 'box', 'card', 'list', 'wrap', 'loop', 'article'])]
for r in relevant:
    print(r)
print('---')
for m in re.finditer(r'rel="bookmark"', html):
    start = max(0, m.start() - 600)
    end = m.end() + 200
    snippet = html[start:end]
    print(snippet[:300])
    print('===')
