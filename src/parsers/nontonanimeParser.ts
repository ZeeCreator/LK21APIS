import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface NontonanimeAnimeItem {
  title: string;
  slug: string;
  poster: string | null;
  rating: number | null;
  type: string | null;
  episode: string | null;
}

export interface NontonanimeHomepage {
  latestEpisodes: NontonanimeAnimeItem[];
  movie: NontonanimeAnimeItem[];
  tv: NontonanimeAnimeItem[];
  popular: NontonanimeAnimeItem[];
  popularGenre: NontonanimeAnimeItem[];
}

export interface NontonanimeJadwalDay {
  day: string;
  dateText: string;
  items: NontonanimeJadwalItem[];
}

export interface NontonanimeJadwalItem {
  title: string;
  slug: string;
  poster: string | null;
  episode: string | null;
  rating: number | null;
  type: string | null;
  time: string | null;
  genres: string[];
}

export interface NontonanimePopulerItem {
  title: string;
  slug: string;
  poster: string | null;
  rating: number | null;
  genre: string | null;
  synopsis: string | null;
}

export interface NontonanimeSearchItem {
  title: string;
  slug: string;
  poster: string | null;
  rating: number | null;
  type: string | null;
  season: string | null;
  synopsis: string | null;
  genres: string[];
}

export interface NontonanimeSearchResult {
  query: string;
  items: NontonanimeSearchItem[];
}

export interface NontonanimeEpisodeItem {
  number: string;
  title: string;
  slug: string;
  date: string | null;
}

export interface NontonanimeGenreItem {
  name: string;
  slug: string;
  totalSeries: number;
  ongoingCount: number;
}

export interface NontonanimeStreamServer {
  name: string;
  url: string;
  index: number;
}

export interface NontonanimeDownloadLink {
  quality: string;
  links: { provider: string; url: string }[];
}

export interface NontonanimeAnimeDetail {
  title: string;
  altTitles: string[];
  slug: string;
  poster: string | null;
  rating: number | null;
  status: string | null;
  studio: string | null;
  type: string | null;
  season: string | null;
  episodeCount: string | null;
  duration: string | null;
  synonyms: string | null;
  aired: string | null;
  genres: { name: string; slug: string }[];
  synopsis: string | null;
  episodes: NontonanimeEpisodeItem[];
  recommendations: NontonanimeAnimeItem[];
}

export interface NontonanimeEpisodeDetail {
  title: string;
  slug: string;
  seriesTitle: string;
  seriesSlug: string;
  episodeNumber: string | null;
  poster: string | null;
  rating: number | null;
  releaseDate: string | null;
  streamServers: NontonanimeStreamServer[];
  currentEmbed: string | null;
  downloads: NontonanimeDownloadLink[];
  prevEpisode: { title: string; slug: string } | null;
  nextEpisode: { title: string; slug: string } | null;
}

function extractSlug(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

// ── Detpost card parser ──

function parseDetpostCard($: cheerio.CheerioAPI, el: Element): { title: string; slug: string; poster: string | null; episode: string | null; dayOrScore: string | null; date: string | null } | null {
  const $el = $(el);
  const link = $el.find('.thumb a').first();
  const href = link.attr('href') || '';
  if (!href) return null;
  const slug = extractSlug(href);
  const poster = $el.find('.thumbz img').first().attr('src') || null;
  const title = $el.find('h2.jdlflm').first().text().trim() || '';
  const epz = $el.find('.epz').first().text().trim() || null;
  const epztipe = $el.find('.epztipe').first().text().trim() || null;
  const newnime = $el.find('.newnime').first().text().trim() || null;
  if (!title) return null;
  return { title, slug, poster, episode: epz, dayOrScore: epztipe, date: newnime };
}

function detpostToAnimeItem(card: ReturnType<typeof parseDetpostCard>): NontonanimeAnimeItem | null {
  if (!card) return null;
  let rating: number | null = null;
  if (card.dayOrScore) {
    const score = parseFloat(card.dayOrScore.replace(/[^0-9.]/g, ''));
    if (!isNaN(score) && score <= 10) rating = score;
  }
  return {
    title: card.title,
    slug: card.slug,
    poster: card.poster,
    rating,
    type: null,
    episode: card.episode,
  };
}

// ── Homepage ──

export function parseNontonanimeHomepage(html: string): NontonanimeHomepage {
  const $ = cheerio.load(html);
  const result: NontonanimeHomepage = {
    latestEpisodes: [],
    movie: [],
    tv: [],
    popular: [],
    popularGenre: [],
  };

  const ongoing: NontonanimeAnimeItem[] = [];
  const completed: NontonanimeAnimeItem[] = [];

  $('.venz').each((i, section) => {
    const items: NontonanimeAnimeItem[] = [];
    $(section).find('.detpost').each((_, el) => {
      const card = parseDetpostCard($, el);
      if (card) items.push(detpostToAnimeItem(card)!);
    });
    if (i === 0) ongoing.push(...items);
    else if (i === 1) completed.push(...items);
  });

  result.latestEpisodes = ongoing;
  result.tv = completed;

  const seenSlugs = new Set<string>();
  const popular: NontonanimeAnimeItem[] = [];
  $('.venz .detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card && !seenSlugs.has(card.slug)) {
      seenSlugs.add(card.slug);
      popular.push(detpostToAnimeItem(card)!);
    }
  });
  result.popular = popular;

  const popGenre: NontonanimeAnimeItem[] = [];
  $('.sidebar-area .detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card) popGenre.push(detpostToAnimeItem(card)!);
  });
  result.popularGenre = popGenre;

  return result;
}

// ── Search ──

export function parseNontonanimeSearch(html: string, query: string): NontonanimeSearchResult {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];

  $('.detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: null,
        type: null,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { query, items };
}

// ── Detail ──

export function parseNontonanimeAnimeDetail(html: string, slug: string): NontonanimeAnimeDetail {
  const $ = cheerio.load(html);
  const result: NontonanimeAnimeDetail = {
    title: '',
    altTitles: [],
    slug,
    poster: null,
    rating: null,
    status: null,
    studio: null,
    type: null,
    season: null,
    episodeCount: null,
    duration: null,
    synonyms: null,
    aired: null,
    genres: [],
    synopsis: null,
    episodes: [],
    recommendations: [],
  };

  result.title = $('.jdlrx h1').first().text().trim() || slug;
  result.poster = $('.fotoanime img.wp-post-image').first().attr('src') || null;

  $('.infozingle p').each((_, el) => {
    const $el = $(el);
    const label = $el.find('b').first().text().trim().toLowerCase();
    const $span = $el.find('span').first();
    const $clone = $span.clone();
    $clone.find('b').remove();
    let value = $clone.text().trim().replace(/^:\s*/, '');

    switch (label) {
      case 'judul':
        if (!result.title) result.title = value;
        break;
      case 'japanese':
        if (value) result.altTitles.push(value);
        break;
      case 'skor': {
        const score = parseFloat(value.replace(/[^0-9.]/g, ''));
        if (!isNaN(score)) result.rating = score;
        break;
      }
      case 'tipe':
        result.type = value || null;
        break;
      case 'status':
        result.status = value || null;
        break;
      case 'total episode':
        result.episodeCount = value || null;
        break;
      case 'durasi':
        result.duration = value || null;
        break;
      case 'tanggal rilis':
        result.aired = value || null;
        break;
      case 'studio':
        result.studio = value || null;
        break;
      case 'genre': {
        $el.find('a').each((_, a) => {
          const name = $(a).text().trim().replace(/,/g, '').trim();
          const gSlug = extractSlug($(a).attr('href') || '');
          if (name) result.genres.push({ name, slug: gSlug });
        });
        break;
      }
    }
  });

  result.synopsis = $('.sinopc').first().text().trim() || null;

  $('.episodelist ul li').each((_, el) => {
    const $el = $(el);
    const $a = $el.find('a').first();
    const href = $a.attr('href') || '';
    const text = $a.text().trim();
    const epSlug = href ? extractSlug(href) : '';
    const date = $el.find('.zeebr').first().text().trim() || null;
    const epNumMatch = text.match(/Episode\s*(\d+)/i);
    const epNumber = epNumMatch ? epNumMatch[1] : text.replace(/^.*Episode\s*/i, '');
    if (epSlug) {
      result.episodes.push({
        number: epNumber,
        title: text,
        slug: epSlug,
        date,
      });
    }
  });

  $('.isi-recommend-anime-series .isi-konten').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('.judul-anime a').first();
    const href = $link.attr('href') || '';
    const rSlug = href ? extractSlug(href) : '';
    if (rSlug && rSlug !== slug) {
      result.recommendations.push({
        title: $link.text().trim(),
        slug: rSlug,
        poster: $el.find('img').first().attr('src') || null,
        rating: null,
        type: null,
        episode: null,
      });
    }
  });

  return result;
}

// ── Episode ──

export function parseNontonanimeEpisode(html: string): NontonanimeEpisodeDetail {
  const $ = cheerio.load(html);
  const result: NontonanimeEpisodeDetail = {
    title: '',
    slug: '',
    seriesTitle: '',
    seriesSlug: '',
    episodeNumber: null,
    poster: null,
    rating: null,
    releaseDate: null,
    streamServers: [],
    currentEmbed: null,
    downloads: [],
    prevEpisode: null,
    nextEpisode: null,
  };

  result.title = $('h1.posttl').first().text().trim() ||
    $('h1').first().text().trim() || '';

  const epMatch = result.title.match(/(?:Episode|episode)\s*(\d+)/i);
  if (epMatch) result.episodeNumber = epMatch[1];

  const seriesLink = $('a[href*="/anime/"]').filter((_, el) => {
    const h = $(el).attr('href') || '';
    return /\/anime\/[^/]+\/?$/.test(h) && !h.includes('/episode/');
  }).first();
  result.seriesSlug = extractSlug(seriesLink.attr('href') || '');

  const titleMatch = result.title.match(/^(.+?)\s+(?:Episode|episode)\s+\d+/i);
  result.seriesTitle = titleMatch ? titleMatch[1].trim() : result.seriesSlug;

  const iframe = $('iframe').first();
  result.currentEmbed = iframe.attr('src') || null;
  if (result.currentEmbed) {
    result.streamServers.push({ name: 'Default', url: result.currentEmbed, index: 1 });
  }

  const downloadGroups: Array<{ quality: string; links: Array<{ provider: string; url: string }> }> = [];
  let currentQuality = 'default';

  $('h2, h3, h4, strong, b').each((_, el) => {
    const text = $(el).text().trim();
    const m = text.match(/(Mp4|MKV)\s+(\d{3,4}p)/i);
    if (m) {
      currentQuality = `${m[1].toUpperCase()} ${m[2].toLowerCase()}`;
    }
  });

  const providerKeywords = ['ODFiles', 'Pdrain', 'Acefile', 'GoFile', 'Mega', 'KFiles'];
  $('a[href*="link.desustream.com"]').each((_, el) => {
    const $a = $(el);
    const text = $a.text().trim();
    const url = $a.attr('href') || '';
    if (!url) return;

    const matchedProvider = providerKeywords.find(k => text.includes(k));
    const provider = matchedProvider || text || 'Unknown';

    const parentText = $a.parent().text().trim();
    let quality = currentQuality;
    const qm = parentText.match(/(Mp4|MKV)\s+(\d{3,4}p)/i);
    if (qm) quality = `${qm[1].toUpperCase()} ${qm[2].toLowerCase()}`;

    let group = downloadGroups.find(g => g.quality === quality);
    if (!group) {
      group = { quality, links: [] };
      downloadGroups.push(group);
    }
    if (!group.links.some(l => l.provider === provider)) {
      group.links.push({ provider, url });
    }
  });

  result.downloads = downloadGroups;

  const prevLink = $('a[href*="/episode/"]').filter((_, el) => {
    return $(el).text().trim().toLowerCase().includes('previous');
  }).first();
  if (prevLink.length) {
    const prevHref = prevLink.attr('href') || '';
    const prevSlug = prevHref ? extractSlug(prevHref) : '';
    const prevNum = prevSlug.match(/episode-(\d+)/i)?.[1] || '';
    if (prevSlug) result.prevEpisode = { title: `Episode ${prevNum}`, slug: prevSlug };
  }

  const nextLink = $('a[href*="/episode/"]').filter((_, el) => {
    return $(el).text().trim().toLowerCase().includes('next');
  }).first();
  if (nextLink.length) {
    const nextHref = nextLink.attr('href') || '';
    const nextSlug = nextHref ? extractSlug(nextHref) : '';
    const nextNum = nextSlug.match(/episode-(\d+)/i)?.[1] || '';
    if (nextSlug) result.nextEpisode = { title: `Episode ${nextNum}`, slug: nextSlug };
  }

  return result;
}

// ── Jadwal ──

export function parseNontonanimeJadwal(html: string): NontonanimeJadwalDay[] {
  const $ = cheerio.load(html);
  const result: NontonanimeJadwalDay[] = [];

  $('.kglist321').each((_, el) => {
    const $el = $(el);
    const day = $el.find('h2').first().text().trim();
    const items: NontonanimeJadwalItem[] = [];
    $el.find('ul li a[href*="/anime/"]').each((_, a) => {
      const $a = $(a);
      const href = $a.attr('href') || '';
      const title = $a.text().trim() || '';
      const slug = href ? extractSlug(href) : '';
      if (title && slug) {
        items.push({
          title,
          slug,
          poster: null,
          episode: null,
          rating: null,
          type: null,
          time: null,
          genres: [],
        });
      }
    });
    if (day) result.push({ day, dateText: '', items });
  });

  return result;
}

// ── Populer ──

export function parseNontonanimePopuler(html: string): NontonanimePopulerItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimePopulerItem[] = [];

  $('.sidebar-area .detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: null,
        genre: card.dayOrScore,
        synopsis: null,
      });
    }
  });

  return items;
}

// ── Ongoing ──

export function parseNontonanimeOngoing(html: string): NontonanimeAnimeItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimeAnimeItem[] = [];
  const seen = new Set<string>();

  $('.detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card && !seen.has(card.slug)) {
      seen.add(card.slug);
      items.push(detpostToAnimeItem(card)!);
    }
  });

  return items;
}

// ── Genre ──

export function parseNontonanimeGenre(html: string): NontonanimeGenreItem[] {
  const $ = cheerio.load(html);
  const genres: NontonanimeGenreItem[] = [];

  $('.genres li a, ul.genres li a, .genre-list a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const name = $el.text().trim();
    const slug = href ? extractSlug(href) : '';
    if (name && slug && name !== 'Suprise Me') {
      genres.push({ name, slug, totalSeries: 0, ongoingCount: 0 });
    }
  });

  return genres;
}

// ── Genre Detail ──

export function parseNontonanimeGenreDetail(html: string, genreSlug: string): { genre: string; items: NontonanimeSearchItem[] } {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];
  const genreName = $('h1').first().text().trim() || $('title').first().text().split('|')[0]?.trim() || genreSlug;

  $('.venz .detpost').each((_, el) => {
    const card = parseDetpostCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: null,
        type: null,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { genre: genreName, items };
}
