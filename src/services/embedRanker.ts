const BLOCKED_DOMAINS = [
  'abyssplayer.com',
  'abysscdn.com',
];

const PRIORITY_ORDER: { domain: string; priority: number }[] = [
  { domain: 'veev.to', priority: 1 },
  { domain: 'minochinos.com', priority: 2 },
  { domain: 'embed4me.vip', priority: 3 },
  { domain: 'playerp2p.online', priority: 4 },
  { domain: 'upns.live', priority: 5 },
  { domain: 'voe.sx', priority: 6 },
  { domain: 'hgcloud.to', priority: 7 },
];

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function getPriority(domain: string): number {
  const entry = PRIORITY_ORDER.find((p) => domain.includes(p.domain));
  return entry ? entry.priority : 99;
}

function isBlocked(url: string): boolean {
  const domain = getDomain(url);
  return BLOCKED_DOMAINS.some((b) => domain.includes(b));
}

export interface RankedSource {
  url: string;
  server?: string;
  isEmbed?: boolean;
  streamUrl?: string;
  streamType?: 'mp4' | 'm3u8' | 'embed';
  priority: number;
  blocked: boolean;
}

export function rankSources(
  sources: { url: string; server?: string; isEmbed?: boolean; streamUrl?: string; streamType?: 'mp4' | 'm3u8' | 'embed' }[]
): RankedSource[] {
  const seen = new Set<string>();
  const ranked: RankedSource[] = [];

  for (const src of sources) {
    const domain = getDomain(src.url);
    if (!domain) continue;
    if (seen.has(domain)) continue;
    seen.add(domain);

    const blocked = isBlocked(src.url);
    const priority = getPriority(domain);

    ranked.push({
      url: src.url,
      server: src.server,
      isEmbed: src.isEmbed,
      streamUrl: src.streamUrl,
      streamType: src.streamType,
      priority,
      blocked,
    });
  }

  ranked.sort((a, b) => {
    if (a.blocked !== b.blocked) return a.blocked ? 1 : -1;
    return a.priority - b.priority;
  });

  return ranked;
}
