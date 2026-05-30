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

function parseCard(
  $: cheerio.CheerioAPI,
  el: Element
): { title: string; slug: string; poster: string | null; episode: string | null; type: string | null } | null {
  const $el = $(el);
  const $link = $el.find('.bsx > a').first();
  const href = $link.attr('href') || '';
  if (!href) return null;

  const slug = extractSlug(href);
  const poster = $el.find('.limit img').first().attr('src') || null;
  const $tt = $el.find('.tt').first();
  const title = ($tt.find('h2').first().text().trim() || $tt.text().trim()) || '';
  const episode = $el.find('.epx').first().text().trim() || null;
  const type = $el.find('.typez').first().text().trim() || null;

  if (!title) return null;
  return { title, slug, poster, episode, type };
}

function cardToAnimeItem(card: ReturnType<typeof parseCard>): NontonanimeAnimeItem | null {
  if (!card) return null;
  return {
    title: card.title,
    slug: card.slug,
    poster: card.poster,
    rating: null,
    type: card.type,
    episode: card.episode,
  };
}

const DAY_CLASS_MAP: Record<string, string> = {
  sch_saturday: 'Sabtu',
  sch_sunday: 'Minggu',
  sch_monday: 'Senin',
  sch_tuesday: 'Selasa',
  sch_wednesday: 'Rabu',
  sch_thursday: 'Kamis',
  sch_friday: "Jum'at",
};

export function parseNontonanimeHomepage(html: string): NontonanimeHomepage {
  const $ = cheerio.load(html);
  const result: NontonanimeHomepage = {
    latestEpisodes: [],
    movie: [],
    tv: [],
    popular: [],
    popularGenre: [],
  };

  const items: NontonanimeAnimeItem[] = [];
  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) items.push(cardToAnimeItem(card)!);
  });
  result.latestEpisodes = items;
  result.tv = items;

  const seen = new Set<string>();
  const popular: NontonanimeAnimeItem[] = [];
  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card && !seen.has(card.slug)) {
      seen.add(card.slug);
      popular.push(cardToAnimeItem(card)!);
    }
  });
  result.popular = popular;

  const sidebarCards: NontonanimeAnimeItem[] = [];
  $('.sidebar, aside, #sidebar').find('article.bs, .bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) sidebarCards.push(cardToAnimeItem(card)!);
  });
  result.popularGenre = sidebarCards;

  return result;
}

export function parseNontonanimeSearch(html: string, query: string): NontonanimeSearchResult {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];

  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: null,
        type: card.type,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { query, items };
}

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

  result.title = $('h1.entry-title').first().text().trim() || slug;
  result.poster = $('.thumb img, .thumbz img').first().attr('src') || null;

  $('.spe span').each((_, el) => {
    const $el = $(el);
    const $b = $el.find('b').first();
    const label = $b.text().trim().toLowerCase().replace(':', '');
    const value = $el.text().replace($b.text(), '').replace(':', '').trim();
    switch (label) {
      case 'status':
        result.status = value || null;
        break;
      case 'studio':
        result.studio = value || null;
        break;
      case 'tipe':
        result.type = value || null;
        break;
      case 'season':
        result.season = value || null;
        break;
      case 'durasi':
        result.duration = value || null;
        break;
      case 'dirilis':
        if (!result.aired) result.aired = value || null;
        break;
    }
  });

  $('.genxed a').each((_, el) => {
    const name = $(el).text().trim();
    const gSlug = extractSlug($(el).attr('href') || '');
    if (name) result.genres.push({ name, slug: gSlug });
  });

  result.synopsis = $('.desc').first().text().trim() || null;

  $('.eplister ul li').each((_, el) => {
    const $el = $(el);
    const $a = $el.find('a').first();
    const href = $a.attr('href') || '';
    const epSlug = href ? extractSlug(href) : '';
    const epNumber = $el.find('.epl-num').first().text().trim();
    const epTitle = $el.find('.epl-title').first().text().trim();
    const epDate = $el.find('.epl-date').first().text().trim() || null;
    if (epSlug) {
      result.episodes.push({
        number: epNumber,
        title: epTitle || epNumber,
        slug: epSlug,
        date: epDate,
      });
    }
  });

  const seenRec = new Set<string>();
  $('.bixbox').each((_, section) => {
    const header = $(section).find('h1, h2, h3, h4').first().text().trim().toLowerCase();
    if (header.includes('rekomendasi') || header.includes('rekomend')) {
      $(section).find('.bs, article.bs').each((_, el) => {
        const card = parseCard($, el);
        if (card && !seenRec.has(card.slug) && card.slug !== slug) {
          seenRec.add(card.slug);
          result.recommendations.push(cardToAnimeItem(card)!);
        }
      });
    }
  });

  return result;
}

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

  result.title = $('h1.entry-title').first().text().trim() || '';

  const epNumEl = $('meta[itemprop="episodeNumber"]').first();
  result.episodeNumber = epNumEl.attr('content') || null;

  const posterImg = $('.tb img').first();
  result.poster = posterImg.attr('data-src') || posterImg.attr('src') || null;

  const seriesLink = $('.ts-breadcrumb a[href*="/anime/"], .year a[href*="/anime/"]').first();
  const seriesHref = seriesLink.attr('href') || '';
  result.seriesSlug = seriesHref ? extractSlug(seriesHref) : '';
  result.seriesTitle = seriesLink.text().trim() || result.seriesSlug;

  const updateDateText = $('.updated').first().text().trim();
  if (updateDateText) result.releaseDate = updateDateText;

  const iframe = $('.megavid iframe').first();
  result.currentEmbed = iframe.attr('src') || null;
  if (result.currentEmbed) {
    result.streamServers.push({ name: 'LayarWibu', url: result.currentEmbed, index: 1 });
  }

  result.downloads = [];

  const prevLink = $('a').filter((_, el) => $(el).text().trim() === 'Prev').first();
  if (prevLink.length) {
    const prevHref = prevLink.attr('href') || '';
    const prevSlug = prevHref ? extractSlug(prevHref) : '';
    if (prevSlug) result.prevEpisode = { title: 'Previous Episode', slug: prevSlug };
  }

  const nextLink = $('a').filter((_, el) => $(el).text().trim() === 'Next').first();
  if (nextLink.length) {
    const nextHref = nextLink.attr('href') || '';
    const nextSlug = nextHref ? extractSlug(nextHref) : '';
    if (nextSlug) result.nextEpisode = { title: 'Next Episode', slug: nextSlug };
  }

  return result;
}

export function parseNontonanimeJadwal(html: string): NontonanimeJadwalDay[] {
  const $ = cheerio.load(html);
  const result: NontonanimeJadwalDay[] = [];

  $('.bixbox.schedulepage').each((_, section) => {
    const $section = $(section);
    const classes = $section.attr('class') || '';
    let day = '';

    for (const [cls, name] of Object.entries(DAY_CLASS_MAP)) {
      if (classes.includes(cls)) {
        day = name;
        break;
      }
    }

    if (!day) {
      day = $section.find('.releases h3 span, .releases h2 span').first().text().trim();
    }

    const items: NontonanimeJadwalItem[] = [];
    $section.find('.listupd .bs').each((_, el) => {
      const card = parseCard($, el);
      if (card) {
        const timeEl = $(el).find('.epx').first().text().trim() || null;
        items.push({
          title: card.title,
          slug: card.slug,
          poster: card.poster,
          episode: card.episode,
          rating: null,
          type: card.type,
          time: timeEl,
          genres: [],
        });
      }
    });

    if (day && items.length > 0) {
      result.push({ day, dateText: '', items });
    }
  });

  return result;
}

export function parseNontonanimePopuler(html: string): NontonanimePopulerItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimePopulerItem[] = [];

  $('.sidebar, aside, #sidebar').find('.bs, article.bs').each((_, el) => {
    const $el = $(el);
    const $link = $el.find('.bsx > a, a[href*="/anime/"]').first();
    const href = $link.attr('href') || '';
    if (!href) return;
    const slug = extractSlug(href);
  const $tt = $el.find('.tt').first();
  const title = ($tt.find('h2').first().text().trim() || $tt.text().trim()) || '';
    const poster = $el.find('.limit img').first().attr('src') || null;
    const epx = $el.find('.epx').first().text().trim() || null;
    if (title && slug) {
      items.push({ title, slug, poster, rating: null, genre: epx, synopsis: null });
    }
  });

  return items;
}

export function parseNontonanimeOngoing(html: string): NontonanimeAnimeItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimeAnimeItem[] = [];
  const seen = new Set<string>();

  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card && !seen.has(card.slug)) {
      seen.add(card.slug);
      items.push(cardToAnimeItem(card)!);
    }
  });

  return items;
}

export function parseNontonanimeGenre(html: string): NontonanimeGenreItem[] {
  const $ = cheerio.load(html);
  const genres: NontonanimeGenreItem[] = [];

  $('ul.taxindex li a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const name = $el.find('.name').first().text().trim();
    const countText = $el.find('.count').first().text().trim();
    const slug = href ? extractSlug(href) : '';
    const count = parseInt(countText, 10) || 0;
    if (name && slug) {
      genres.push({ name, slug, totalSeries: count, ongoingCount: 0 });
    }
  });

  return genres;
}

export function parseNontonanimeGenreDetail(html: string, genreSlug: string): { genre: string; items: NontonanimeSearchItem[] } {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];
  const genreName = $('h1').first().text().trim() || $('title').first().text().split('•')[0]?.trim() || genreSlug;

  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: null,
        type: card.type,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { genre: genreName, items };
}
