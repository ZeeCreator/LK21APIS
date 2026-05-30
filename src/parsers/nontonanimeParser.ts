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

function extractIdAndSlugFromAnimeUrl(url: string): string {
  const match = url.match(/\/anime\/(\d+)\/([^/]+)/);
  if (match) return `${match[1]}/${match[2]}`;
  return extractSlug(url);
}

function parseProductCard(
  $: cheerio.CheerioAPI,
  el: Element
): NontonanimeAnimeItem | null {
  const $el = $(el);
  const link = $el.find('> a').first();
  const href = link.attr('href') || '';
  if (!href || href === '#') return null;

  const imgDiv = $el.find('.product__item__pic.set-bg').first();
  const poster =
    imgDiv.attr('data-setbg') ||
    imgDiv.find('img').first().attr('src') ||
    null;

  const epEl = imgDiv.find('.ep').first();
  const epText = epEl.text().trim();
  let episode: string | null = null;
  let rating: number | null = null;

  if (epText) {
    const epMatch = epText.match(/Ep\s*(\d+)\s*\/\s*(\d+|\?)/i);
    if (epMatch) {
      episode = epMatch[1];
    } else {
      const score = parseFloat(epText.replace(/[^0-9.]/g, ''));
      if (!isNaN(score)) rating = score;
    }
  }

  const textEl = $el.find('.product__item__text').first();
  const titleEl = textEl.find('h5 a').first();
  const title = titleEl.text().trim() || link.attr('title') || '';

  const typeEl = textEl.find('ul a').first();
  const type = typeEl.text().trim() || null;

  const slug = href ? extractIdAndSlugFromAnimeUrl(href) : '';
  if (!title) return null;

  return { title, slug, poster, rating, type, episode };
}

function parseSidebarProductCard(
  $: cheerio.CheerioAPI,
  el: Element
): NontonanimeAnimeItem | null {
  const $el = $(el);
  const link = $el.closest('a');
  const href = link.attr('href') || '';
  if (!href) return null;

  const poster =
    $el.attr('data-setbg') ||
    $el.find('img').first().attr('src') ||
    null;

  const epEl = $el.find('.ep').first();
  const epText = epEl.text().trim();
  let rating: number | null = null;
  if (epText) {
    const score = parseFloat(epText.replace(/[^0-9.]/g, ''));
    if (!isNaN(score)) rating = score;
  }

  const title = $el.find('h5').first().text().trim() || '';
  const slug = href ? extractIdAndSlugFromAnimeUrl(href) : '';
  if (!title) return null;

  return { title, slug, poster, rating, type: null, episode: null };
}

export function parseNontonanimeHomepage(html: string): NontonanimeHomepage {
  const $ = cheerio.load(html);
  const result: NontonanimeHomepage = {
    latestEpisodes: [],
    movie: [],
    tv: [],
    popular: [],
    popularGenre: [],
  };

  $('.trending__product').each((_, section) => {
    const $section = $(section);
    const title = $section.find('.section-title h4').first().text().trim();

    const items: NontonanimeAnimeItem[] = [];
    $section.find('.product__item').each((_, el) => {
      const item = parseProductCard($, el);
      if (item) items.push(item);
    });

    if (title.includes('Sedang Tayang')) {
      result.latestEpisodes = items;
    } else if (title.includes('Selesai Tayang')) {
      result.tv = items;
    } else if (title.includes('Film Layar Lebar')) {
      result.movie = items;
    }
  });

  const heroItems: NontonanimeAnimeItem[] = [];
  $('.hero__slider .hero__items').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a[href*="/anime/"]').first();
    const href = link.attr('href') || '';
    const title = $el.find('h2').first().text().trim();
    const poster = $el.attr('data-setbg') || null;
    const slug = href ? extractIdAndSlugFromAnimeUrl(href) : '';
    if (title) {
      heroItems.push({ title, slug, poster, rating: null, type: null, episode: null });
    }
  });
  result.popular = heroItems;

  $('.product__sidebar__view__item').each((_, el) => {
    const item = parseSidebarProductCard($, el);
    if (item) result.popularGenre.push(item);
  });

  return result;
}

export function parseNontonanimeAnimeDetail(
  html: string,
  slug: string
): NontonanimeAnimeDetail {
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

  result.title =
    $('.anime__details__title h3').first().text().trim() || slug;

  const altSpan = $('.anime__details__title span').first();
  const altText = altSpan.text().trim();
  if (altText) result.altTitles.push(altText);

  const posterDiv = $('.anime__details__pic.set-bg').first();
  result.poster = posterDiv.attr('data-setbg') || null;

  const scoreText = posterDiv.find('.ep').first().text().trim();
  if (scoreText) {
    const score = parseFloat(scoreText.replace(/[^0-9.]/g, ''));
    if (!isNaN(score)) result.rating = score;
  }

  result.synopsis = $('#synopsisField').first().text().trim() || null;

  $('.anime__details__widget .row > div ul li').each((_, el) => {
    const $el = $(el);
    const label = $el.find('.col-3 span').first().text().trim().replace(':', '');
    const valueEl = $el.find('.col-9').first();

    if (label === 'Tipe') {
      result.type = valueEl.find('a').first().text().trim() || null;
    } else if (label === 'Episode') {
      result.episodeCount = valueEl.find('a').first().text().trim() || null;
    } else if (label === 'Status') {
      result.status = valueEl.find('a').first().text().trim() || null;
    } else if (label === 'Musim') {
      result.season = valueEl.find('a').first().text().trim() || null;
    } else if (label === 'Durasi') {
      result.duration = valueEl.find('a').first().text().trim() || null;
    } else if (label === 'Tayang') {
      result.aired = valueEl.text().trim() || null;
    } else if (label === 'Genre') {
      valueEl.find('a').each((_, a) => {
        const name = $(a).text().trim().replace(/,/g, '').trim();
        const gSlug = extractSlug($(a).attr('href') || '');
        if (name) result.genres.push({ name, slug: gSlug });
      });
    } else if (label === 'Studio') {
      result.studio = valueEl.find('a').first().text().trim() || null;
    }
  });

  const popoverEl = $('#episodeLists').first();
  const dataContent = popoverEl.attr('data-content') || '';
  if (dataContent) {
    const $pop = cheerio.load(dataContent);
    $pop('a[href*="/episode/"]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const text = $(el).text().trim().replace(/^Ep\s*/i, '');
      const epTitle = `Episode ${text}`;
      const epSlug = href ? extractIdAndSlugFromAnimeUrl(href) : '';
      const epNum = text;
      if (epNum) {
        result.episodes.push({
          number: epNum,
          title: epTitle,
          slug: epSlug,
          date: null,
        });
      }
    });
  }

  $('.anime__details__review__related_anime .product__item').each((_, el) => {
    const item = parseProductCard($, el);
    if (item && item.slug !== slug) result.recommendations.push(item);
  });

  return result;
}

export function parseNontonanimeSearch(
  html: string,
  query: string
): NontonanimeSearchResult {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];

  $('.product__item').each((_, el) => {
    const card = parseProductCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: card.rating,
        type: card.type,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { query, items };
}

export function parseNontonanimeJadwal(
  html: string
): NontonanimeJadwalDay[] {
  const $ = cheerio.load(html);
  const result: NontonanimeJadwalDay[] = [];

  $('.schedule__page .schedule__day').each((_, el) => {
    const $el = $(el);
    const day = $el.find('h4').first().text().trim();
    const items: NontonanimeJadwalItem[] = [];

    $el.find('.product__item').each((_, cardEl) => {
      const card = parseProductCard($, cardEl);
      if (card) {
        const timeEl = $el.find('.schedule__time').first();
        items.push({
          title: card.title,
          slug: card.slug,
          poster: card.poster,
          episode: card.episode,
          rating: card.rating,
          type: card.type,
          time: timeEl.text().trim() || null,
          genres: [],
        });
      }
    });

    if (day) {
      result.push({ day, dateText: '', items });
    }
  });

  return result;
}

export function parseNontonanimePopuler(
  html: string
): NontonanimePopulerItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimePopulerItem[] = [];

  $('.product__sidebar__view__item').each((_, el) => {
    const card = parseSidebarProductCard($, el);
    if (card) {
      const synopsis =
        $(el).find('.sidebar-title-h5').first().text().trim() || null;
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: card.rating,
        genre: null,
        synopsis,
      });
    }
  });

  return items;
}

export function parseNontonanimeOngoing(
  html: string
): NontonanimeAnimeItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimeAnimeItem[] = [];
  const seen = new Set<string>();

  $('.product__item').each((_, el) => {
    const card = parseProductCard($, el);
    if (card && !seen.has(card.slug)) {
      seen.add(card.slug);
      items.push(card);
    }
  });

  return items;
}

export function parseNontonanimeGenre(
  html: string
): NontonanimeGenreItem[] {
  const $ = cheerio.load(html);
  const genres: NontonanimeGenreItem[] = [];

  $('.genres__list a.genre__item, .properties__list a.property__item').each(
    (_, el) => {
      const $el = $(el);
      const href = $el.attr('href') || '';
      const name = $el.find('.name').first().text().trim() || $el.text().trim();
      const slug = href ? extractSlug(href) : '';
      if (name && slug) {
        genres.push({ name, slug, totalSeries: 0, ongoingCount: 0 });
      }
    }
  );

  return genres;
}

export function parseNontonanimeGenreDetail(
  html: string,
  genreSlug: string
): { genre: string; items: NontonanimeSearchItem[] } {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];
  const genreName =
    $('.section-title h4').first().text().trim() ||
    $('h1').first().text().trim() ||
    genreSlug;

  $('.product__item').each((_, el) => {
    const card = parseProductCard($, el);
    if (card) {
      items.push({
        title: card.title,
        slug: card.slug,
        poster: card.poster,
        rating: card.rating,
        type: card.type,
        season: null,
        synopsis: null,
        genres: [],
      });
    }
  });

  return { genre: genreName, items };
}

export function parseNontonanimeEpisode(
  html: string
): NontonanimeEpisodeDetail {
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

  const canonical = $('link[rel="canonical"]').attr('href') || '';
  result.slug = canonical ? extractIdAndSlugFromAnimeUrl(canonical) : '';

  const titleTag = $('title').first().text().trim();
  result.title = titleTag || '';

  const epMatch = result.title.match(/\(Episode\s*(\d+)\)/i);
  if (epMatch) result.episodeNumber = epMatch[1];

  const breadcrumbLinks: string[] = [];
  $('.breadcrumb__links a, .breadcrumb__links span').each((_, el) => {
    const text = $(el).text().trim();
    if (text && text !== 'Beranda' && text !== 'Anime') {
      breadcrumbLinks.push(text);
    }
  });

  if (breadcrumbLinks.length >= 1) {
    result.seriesTitle = breadcrumbLinks[0];
  }

  const seriesLink = $('a[href*="/anime/"]').filter((_, el) => {
    const h = $(el).attr('href') || '';
    return /\/anime\/\d+\/[^/]+\/?$/.test(h) && !h.includes('/episode/');
  }).first();
  result.seriesSlug = extractIdAndSlugFromAnimeUrl(
    seriesLink.attr('href') || ''
  );

  const posterDiv = $('.anime__details__pic.set-bg').first();
  result.poster = posterDiv.attr('data-setbg') || null;

  const infoText = $('.breadcrumb__links__v3 .span__v2').first().text().trim();
  const dateMatch = infoText.match(/(\w+,\s*\d+\s+\w+\s+\d{4})/);
  if (dateMatch) result.releaseDate = dateMatch[1];

  const playerIframe = $(
    '#playerContainer iframe, .player__container iframe, .plyr__video-embed iframe'
  ).first();
  result.currentEmbed = playerIframe.attr('src') || null;

  const serverTabs: NontonanimeStreamServer[] = [];
  $('.server__tab, .stream__server a, .server__list a').each((i, el) => {
    const name = $(el).text().trim() || `Server ${i + 1}`;
    const url = $(el).attr('data-embed') || $(el).attr('href') || '';
    if (url) {
      serverTabs.push({ name, url, index: i + 1 });
    }
  });
  result.streamServers = serverTabs;

  const downloadLinks: NontonanimeDownloadLink[] = [];
  $(
    '.download__link, .download__list a, .download__section a'
  ).each((_, el) => {
    const $el = $(el);
    const url = $el.attr('href') || '';
    const provider = $el.text().trim() || '';
    if (url && provider) {
      const existing = downloadLinks.find(
        (d) => d.quality === 'default'
      );
      if (existing) {
        existing.links.push({ provider, url });
      } else {
        downloadLinks.push({
          quality: 'default',
          links: [{ provider, url }],
        });
      }
    }
  });
  result.downloads = downloadLinks;

  const epLinks: string[] = [];
  $('a[href*="/episode/"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (href.includes('/episode/')) {
      epLinks.push(href);
    }
  });

  const uniqueEps = [...new Set(epLinks)];
  const currentIdx = uniqueEps.findIndex(
    (e) => canonical && e === canonical
  );

  if (currentIdx > 0) {
    const prev = uniqueEps[currentIdx - 1];
    const prevNum = prev.match(/\/episode\/(\d+)/)?.[1] || '';
    result.prevEpisode = {
      title: `Episode ${prevNum}`,
      slug: prev ? extractIdAndSlugFromAnimeUrl(prev) : '',
    };
  }

  if (currentIdx >= 0 && currentIdx < uniqueEps.length - 1) {
    const next = uniqueEps[currentIdx + 1];
    const nextNum = next.match(/\/episode\/(\d+)/)?.[1] || '';
    result.nextEpisode = {
      title: `Episode ${nextNum}`,
      slug: next ? extractIdAndSlugFromAnimeUrl(next) : '',
    };
  }

  return result;
}
