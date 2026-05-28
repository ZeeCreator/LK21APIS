import { FastifyRequest, FastifyReply } from 'fastify';
import { watchScraper } from '../scrapers/watchScraper';

const DEFAULT_SLUG = 'the-presidents-cake-2025';

const HTML = (slug: string, sources: any[], resolveStreams: boolean) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Test Stream - ${slug}</title>
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: system-ui, sans-serif; background: #111; color: #eee; padding: 20px; }
h1 { font-size: 1.1rem; margin-bottom: 16px; }
.controls { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
.controls input { flex: 1; min-width: 200px; padding: 8px 12px; border: 1px solid #333; border-radius: 6px; background: #222; color: #eee; }
.controls button { padding: 8px 16px; border: none; border-radius: 6px; background: #2563eb; color: #fff; cursor: pointer; }
.controls button:hover { background: #1d4ed8; }
.controls label { display: flex; align-items: center; gap: 6px; color: #aaa; font-size: 0.85rem; cursor: pointer; }
.source { background: #1a1a1a; border: 1px solid #333; border-radius: 8px; margin-bottom: 12px; overflow: hidden; }
.source-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: #222; border-bottom: 1px solid #333; gap: 8px; flex-wrap: wrap; }
.name { font-weight: 600; color: #60a5fa; font-size: 0.85rem; }
.url { color: #666; font-size: 0.7rem; flex: 1; min-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.actions { display: flex; gap: 6px; }
.actions a, .actions button { padding: 4px 12px; border: none; border-radius: 4px; cursor: pointer; font-size: 0.75rem; text-decoration: none; }
.btn-popout { background: #1e3a5f; color: #60a5fa; }
.btn-iframe { background: #14532d; color: #4ade80; }
.status { font-size: 0.7rem; padding: 2px 8px; border-radius: 4px; }
.status.embed { background: #1e3a5f; color: #60a5fa; }
.status.mp4 { background: #14532d; color: #4ade80; }
.status.m3u8 { background: #581c87; color: #c084fc; }
iframe { width: 100%; height: 400px; border: none; display: none; }
iframe.active { display: block; }
.tab-bar { display: flex; border-bottom: 1px solid #333; background: #1a1a1a; }
.tab-bar button { padding: 8px 16px; border: none; background: none; color: #888; cursor: pointer; font-size: 0.8rem; border-bottom: 2px solid transparent; }
.tab-bar button:hover { color: #eee; }
.tab-bar button.active { color: #60a5fa; border-bottom-color: #60a5fa; }
.empty { text-align: center; padding: 40px; color: #666; }
</style>
</head>
<body>

<form class="controls" method="get" action="/api/v1/teststream/">
  <input type="text" name="slug" value="${slug}">
  <label>
    <input type="checkbox" name="resolve" value="true" ${resolveStreams ? 'checked' : ''}>
    Resolve
  </label>
  <button type="submit">Load</button>
</form>

<h1>${sources.length} source${sources.length !== 1 ? 's' : ''} for ${slug}</h1>

<div class="tab-bar">
  ${sources.map((s, i) => `<button class="${i === 0 ? 'active' : ''}" onclick="switchTab(${i})">${s.server || 'S' + (i + 1)}</button>`).join('')}
</div>

${sources.length === 0 ? '<div class="empty">No sources found</div>' : ''}

${sources.map((s, i) => {
  const embedUrl = (s.streamUrl || s.url).replace(/"/g, '&quot;');
  const isEmbed = s.streamType === 'embed' || (!s.streamType && s.isEmbed !== false);
  const statusClass = s.streamType === 'mp4' ? 'mp4' : s.streamType === 'm3u8' ? 'm3u8' : 'embed';
  const statusLabel = s.streamType || 'embed';
  return `<div class="source" id="source-${i}" style="display:${i === 0 ? 'block' : 'none'}">
    <div class="source-header">
      <span class="name">${s.server || 'Source ' + (i + 1)}</span>
      <span class="url" title="${embedUrl}">${embedUrl}</span>
      <span class="status ${statusClass}">${statusLabel}</span>
      <div class="actions">
        <a class="btn-popout" href="${embedUrl}" target="_blank" rel="noopener">Popout</a>
        <button class="btn-iframe" onclick="reloadIframe(${i})">Reload</button>
      </div>
    </div>
    ${isEmbed
      ? `<iframe id="iframe-${i}" src="${embedUrl}" allowfullscreen allow="autoplay; encrypted-media; fullscreen; picture-in-picture" style="display:${i === 0 ? 'block' : 'none'}"></iframe>`
      : `<div style="padding:20px;text-align:center;background:#222;">
          <p style="margin-bottom:8px;color:#888;font-size:0.85rem;">Direct stream</p>
          <a href="${embedUrl}" target="_blank" style="color:#60a5fa;">${embedUrl}</a>
         </div>`
    }
  </div>`;
}).join('\n')}

<script>
function switchTab(idx) {
  document.querySelectorAll('.source').forEach((el, i) => el.style.display = i === idx ? 'block' : 'none');
  document.querySelectorAll('.tab-bar button').forEach((el, i) => el.className = i === idx ? 'active' : '');
  const iframe = document.getElementById('iframe-' + idx);
  if (iframe) iframe.style.display = 'block';
}
function reloadIframe(idx) {
  const iframe = document.getElementById('iframe-' + idx);
  if (iframe) iframe.src = iframe.src;
}
</script>

</body>
</html>`;

export class TestStreamController {
  async serve(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const { slug: rawSlug, resolve: resolveParam } = request.query as { slug?: string; resolve?: string };
    const slug = rawSlug || DEFAULT_SLUG;
    const resolveStreams = resolveParam === 'true';

    try {
      const sources = await watchScraper.scrape(slug, resolveStreams);
      reply.header('Content-Type', 'text/html; charset=utf-8');
      reply.send(HTML(slug, sources, resolveStreams));
    } catch (err: any) {
      reply.status(500).send(`<html><body><h1>Error</h1><p>${err.message}</p></body></html>`);
    }
  }
}

export const testStreamController = new TestStreamController();
