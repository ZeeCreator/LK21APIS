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

function parseAnimeCardSeries($: cheerio.CheerioAPI, el: Element): NontonanimeAnimeItem {
  const $el = $(el);
  const link = $el.find('a').first();
  const href = link.attr('href') || '';

  const img = $el.find('.limit img, img').first();
  const poster = img.attr('src') || img.attr('data-src') || null;

  const titleEl = $el.find('.title .entry-title span[data-title-default], .title span[data-title-default], h3.entry-title span[data-title-default], .title span').first();
  const title = titleEl.attr('data-title-default') || titleEl.text().trim() || img.attr('alt') || '';

  const epEl = $el.find('.epx, .types.episodes, .episode').first();
  const episode = epEl.length ? epEl.text().trim().replace(/^\+?/, '') : null;

  const typeEl = $el.find('.typez, .types').first();
  const type = typeEl.length ? typeEl.text().trim() : null;

  const scoreEl = $el.find('.kotakscore, .rating .value, .score').first();
  let rating: number | null = null;
  const scoreText = scoreEl.text().trim().replace(/[^0-9.]/g, '');
  if (scoreText) {
    const p = parseFloat(scoreText);
    if (!isNaN(p)) rating = p;
  }

  const slug = href ? extractSlug(href) : '';

  return { title, slug, poster: poster ? poster : null, rating, type, episode };
}

export function parseNontonanimeHomepage(html: string): NontonanimeHomepage {
  const $ = cheerio.load(html);
  const result: NontonanimeHomepage = {
    latestEpisodes: [], movie: [], tv: [], popular: [], popularGenre: [],
  };

  $('#postbaru .misha_posts_wrap article.animeseries').each((_, el) => {
    const item = parseAnimeCardSeries($, el);
    if (item.title) result.latestEpisodes.push(item);
  });

  $('#series-footer #tab-7 .animeseries').each((_, el) => {
    const item = parseAnimeCardSeries($, el);
    if (item.title) result.movie.push(item);
  });

  $('#series-footer #tab-8 .animeseries').each((_, el) => {
    const item = parseAnimeCardSeries($, el);
    if (item.title) result.tv.push(item);
  });

  $('#series-footer #tab-9 .animeseries').each((_, el) => {
    const item = parseAnimeCardSeries($, el);
    if (item.title) result.popular.push(item);
  });

  $('#series-footer #tab-10 .animeseries').each((_, el) => {
    const item = parseAnimeCardSeries($, el);
    if (item.title) result.popularGenre.push(item);
  });

  return result;
}

export function parseNontonanimeAnimeDetail(html: string, slug: string): NontonanimeAnimeDetail {
  const $ = cheerio.load(html);
  const result: NontonanimeAnimeDetail = {
    title: '', altTitles: [], slug, poster: null, rating: null,
    status: null, studio: null, type: null, season: null,
    episodeCount: null, duration: null, synonyms: null, aired: null,
    genres: [], synopsis: null, episodes: [], recommendations: [],
  };

  const titleSpan = $('h1.entry-title span[data-title-default]').first();
  result.title = titleSpan.attr('data-title-default') || titleSpan.text().trim() || slug;

  result.poster = $('.anime-card__sidebar img').first().attr('src') || null;

  const scoreText = $('.anime-card__score .value').first().text().trim();
  if (scoreText) {
    const p = parseFloat(scoreText);
    if (!isNaN(p)) result.rating = p;
  }
  result.type = $('.anime-card__score .type').first().text().trim() || null;

  $('.details-list li').each((_, el) => {
    const strong = $(el).find('strong').text().trim().replace(':', '');

    if (strong === 'Studios') result.studio = $(el).contents().last().text().trim();
    if (strong === 'Synonyms') result.synonyms = $(el).contents().last().text().trim();
    if (strong === 'Aired') result.aired = $(el).contents().last().text().trim();
  });

  const altTitleStrong = $('.details-list li strong:contains("English:")').first();
  if (altTitleStrong.length) {
    const parentLi = altTitleStrong.closest('li');
    const altTitle = parentLi.contents().last().text().trim();
    if (altTitle) result.altTitles.push(altTitle);
  }

  $('.anime-card__genres a.genre-tag').each((_, el) => {
    const name = $(el).text().trim();
    const gSlug = extractSlug($(el).attr('href') || '');
    if (name) result.genres.push({ name, slug: gSlug });
  });

  $('.anime-card__quick-info .info-item').each((_, el) => {
    const text = $(el).text().trim();
    if (/episode/i.test(text) || /eps/i.test(text)) {
      result.episodeCount = text.replace(/episodes?/i, '').trim();
    }
    if (/min/i.test(text) && /per/i.test(text)) {
      result.duration = text.trim();
    }
    if (/status/i.test(text) || text.includes('Finished') || text.includes('Airing')) {
      result.status = text;
    }
  });

  $('.anime-card__quick-info .season a').each((_, el) => {
    result.season = $(el).text().trim();
  });

  result.synopsis = $('#tab-synopsis .synopsis-prose p').first().text().trim() || null;

  $('.episode-list-items a.episode-item').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const epTitle = $el.find('.ep-title').first().text().trim();
    const date = $el.find('.ep-date').first().text().trim() || null;
    if (epTitle) {
      result.episodes.push({
        number: epTitle.replace(/^Episode\s*/i, '').trim(),
        title: epTitle,
        slug: href ? extractSlug(href) : '',
        date,
      });
    }
  });

  $('.related .as-anime-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('.as-anime-title').attr('data-title-default') || $el.find('.as-anime-title').text().trim() || '';
    const img = $el.find('.as-card-thumbnail img').first().attr('src') || null;
    if (title && href) {
      result.recommendations.push({
        title, slug: extractSlug(href),
        poster: img, rating: null, type: null, episode: null,
      });
    }
  });

  return result;
}

export function parseNontonanimeSearch(html: string, query: string): NontonanimeSearchResult {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];

  $('.archive .as-anime-grid .as-anime-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('.as-anime-title').attr('data-title-default') || $el.find('.as-anime-title').text().trim() || '';
    const poster = $el.find('.as-card-thumbnail img').first().attr('src') || null;
    const synopsis = $el.find('.as-synopsis').first().text().trim() || null;
    const season = $el.find('.as-season').text().trim().replace(/[📅]/g, '').trim() || null;

    const typeEl = $el.find('.as-type').first().text().trim().replace(/[📺]/g, '').trim();
    const type = typeEl || null;

    const ratingText = $el.find('.as-rating').first().text().trim().replace(/[⭐]/g, '').trim();
    let rating: number | null = null;
    if (ratingText) {
      const p = parseFloat(ratingText);
      if (!isNaN(p)) rating = p;
    }

    const genres: string[] = [];
    $el.find('.as-genres .as-genre-tag').each((_, gEl) => {
      const g = $(gEl).text().trim();
      if (g) genres.push(g);
    });

    const slug = href ? extractSlug(href) : '';
    if (title) {
      items.push({ title, slug, poster, rating, type, season, synopsis, genres });
    }
  });

  return { query, items };
}

export function parseNontonanimeJadwal(html: string): NontonanimeJadwalDay[] {
  const $ = cheerio.load(html);
  const result: NontonanimeJadwalDay[] = [];

  $('.as-tab-content').each((_, el) => {
    const $el = $(el);
    const id = $el.attr('id') || '';
    const dateText = $el.attr('data-date-text') || '';
    const items: NontonanimeJadwalItem[] = [];

    $el.find('.as-anime-card').each((_, cardEl) => {
      const $card = $(cardEl);
      const href = $card.attr('href') || '';
      const title = $card.find('.as-anime-title').text().trim() || '';
      const poster = $card.find('.as-card-thumbnail img').first().attr('src') || null;

      const epsText = $card.find('.jr-ep-text').first().text().trim() || null;
      const badgeText = $card.find('.jr-type-badge').first().text().trim() || null;

      const ratingText = $card.find('.rating-text').first().text().trim().replace(/[⭐]/g, '').trim();
      let rating: number | null = null;
      if (ratingText) {
        const p = parseFloat(ratingText);
        if (!isNaN(p)) rating = p;
      }

      const timeText = $card.find('.time-text').first().text().trim().replace(/[⏰]/g, '').trim() || null;

      const genres: string[] = [];
      $card.find('.jr-genre-pill').each((_, gEl) => {
        const g = $(gEl).text().trim();
        if (g) genres.push(g);
      });

      if (title) {
        items.push({
          title, slug: extractSlug(href), poster,
          episode: epsText, rating, type: badgeText,
          time: timeText, genres,
        });
      }
    });

    if (id) {
      result.push({ day: id, dateText, items });
    }
  });

  return result;
}

export function parseNontonanimePopuler(html: string): NontonanimePopulerItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimePopulerItem[] = [];

  $('.contentpost ul.rank li a').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('h2').text().trim() || '';
    const poster = $el.find('img').first().attr('src') || null;
    const synopsis = $el.find('p').first().text().trim() || null;
    const genreText = $el.find('.viewer').first().text().trim().replace(/^Genre\s*:\s*/i, '') || null;

    const ratingText = $el.find('.kotakscore').first().text().trim().replace(/[^0-9.]/g, '');
    let rating: number | null = null;
    if (ratingText) {
      const p = parseFloat(ratingText);
      if (!isNaN(p)) rating = p;
    }

    if (title) {
      items.push({ title, slug: extractSlug(href), poster, rating, genre: genreText, synopsis });
    }
  });

  return items;
}

export function parseNontonanimeOngoing(html: string): NontonanimeAnimeItem[] {
  const $ = cheerio.load(html);
  const items: NontonanimeAnimeItem[] = [];

  $('.gacha-container .gacha-grid .gacha-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('.info-panel h3.title').text().trim() || '';
    const poster = $el.find('.image-area img').first().attr('src') || null;
    const epsText = $el.find('.episodes').first().text().trim().replace(/^Ep\.\s*/i, '') || null;

    const ratingStars = $el.find('.skor-angka').first().text().trim().replace(/[()]/g, '');
    let rating: number | null = null;
    if (ratingStars) {
      const p = parseFloat(ratingStars);
      if (!isNaN(p)) rating = p;
    }

    if (title) {
      items.push({ title, slug: extractSlug(href), poster, rating, type: null, episode: epsText });
    }
  });

  return items;
}

export function parseNontonanimeGenre(html: string): NontonanimeGenreItem[] {
  const $ = cheerio.load(html);
  const genres: NontonanimeGenreItem[] = [];

  $('.genre-grid-container .genre-grid-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const name = $el.find('.genre-name').text().trim() || '';
    const totalText = $el.find('.detail-item.count span').first().text().trim().replace(/[^0-9]/g, '');
    const ongoingText = $el.find('.detail-item.ongoing span').first().text().trim().replace(/[^0-9]/g, '');

    const totalSeries = totalText ? parseInt(totalText, 10) || 0 : 0;
    const ongoingCount = ongoingText ? parseInt(ongoingText, 10) || 0 : 0;

    if (name) {
      genres.push({ name, slug: extractSlug(href), totalSeries, ongoingCount });
    }
  });

  return genres;
}

export function parseNontonanimeGenreDetail(html: string, genreSlug: string): { genre: string; items: NontonanimeSearchItem[] } {
  const $ = cheerio.load(html);
  const items: NontonanimeSearchItem[] = [];
  const genreName = $('.releases h1').first().text().trim().replace(/^Genre\s*/i, '') || genreSlug;

  $('.as-anime-grid .as-anime-card').each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    const title = $el.find('.as-anime-title').attr('data-title-default') || $el.find('.as-anime-title').text().trim() || '';
    const poster = $el.find('.as-card-thumbnail img').first().attr('src') || null;
    const synopsis = $el.find('.as-synopsis').first().text().trim() || null;

    const typeEl = $el.find('.as-type').first().text().trim().replace(/[📺]/g, '').trim();
    const type = typeEl || null;

    const ratingText = $el.find('.as-rating').first().text().trim().replace(/[⭐]/g, '').trim();
    let rating: number | null = null;
    if (ratingText) {
      const p = parseFloat(ratingText);
      if (!isNaN(p)) rating = p;
    }

    const genres: string[] = [];
    $el.find('.as-genres .as-genre-tag').each((_, gEl) => {
      const g = $(gEl).text().trim();
      if (g) genres.push(g);
    });

    if (title) {
      items.push({ title, slug: extractSlug(href), poster, rating, type, season: null, synopsis, genres });
    }
  });

  return { genre: genreName, items };
}

export function parseNontonanimeEpisode(html: string): NontonanimeEpisodeDetail {
  const $ = cheerio.load(html);
  const result: NontonanimeEpisodeDetail = {
    title: '', slug: '', seriesTitle: '', seriesSlug: '',
    episodeNumber: null, poster: null, rating: null,
    releaseDate: null, streamServers: [], currentEmbed: null,
    downloads: [], prevEpisode: null, nextEpisode: null,
  };

  result.title = $('.entry-title').first().text().trim() || '';
  result.slug = extractSlug($('link[rel="canonical"]').attr('href') || '');

  const img = $('.tb img, .thumb img, .anime-card__sidebar img').first();
  result.poster = img.attr('src') || null;

  const dateText = $('.updated, .ep-date').first().text().trim();
  if (dateText) result.releaseDate = dateText;

  const ratingText = $('.rating strong, .anime-card__score .value').first().text().trim();
  if (ratingText) {
    const p = parseFloat(ratingText.replace(/[^0-9.]/g, ''));
    if (!isNaN(p)) result.rating = p;
  }

  const seriesLink = $('a[href*="/anime/"]').filter((_, el) => {
    const h = $(el).attr('href') || '';
    return /\/anime\/[^/]+\/$/.test(h);
  }).first();
  result.seriesTitle = seriesLink.text().trim();
  result.seriesSlug = extractSlug(seriesLink.attr('href') || '');

  const embedIframe = $('#embed_holder iframe, #pembed iframe, .player-embed iframe').first();
  result.currentEmbed = embedIframe.attr('src') || null;

  $('.mirror option').each((_, el) => {
    const $opt = $(el);
    const value = $opt.attr('value') || '';
    const name = $opt.text().trim();
    const idx = parseInt($opt.attr('data-index') || '0', 10);
    if (!value || idx === 0) return;
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      const srcMatch = decoded.match(/<IFRAME[^>]*SRC="([^"]+)"/i);
      if (srcMatch) {
        result.streamServers.push({ name, url: srcMatch[1], index: idx });
      }
    } catch { }
  });

  $('.soraddlx').each((_, el) => {
    const $el = $(el);
    const quality = $el.find('.sorattlx h3').text().trim() || 'Unknown';
    const dl: NontonanimeDownloadLink = { quality, links: [] };
    $el.find('.soraurlx').each((_, urlEl) => {
      $(urlEl).find('a').each((_, aEl) => {
        const provider = $(aEl).text().trim();
        const url = $(aEl).attr('href') || '';
        if (url && provider && provider !== '*') {
          dl.links.push({ provider, url });
        }
      });
    });
    if (dl.links.length > 0) result.downloads.push(dl);
  });

  const prevLink = $('.nvs a[rel="prev"]').first();
  const prevHref = prevLink.attr('href') || '';
  if (prevHref) {
    result.prevEpisode = {
      title: prevLink.find('.tex').text().trim().replace(/^Prev\s*/i, '').trim() || '',
      slug: extractSlug(prevHref),
    };
  }

  const nextLink = $('a[rel="next"]').first();
  const nextHref = nextLink.attr('href') || '';
  if (nextHref) {
    result.nextEpisode = {
      title: nextLink.find('.tex').text().trim().replace(/^Next\s*/i, '').trim() || '',
      slug: extractSlug(nextHref),
    };
  }

  return result;
}
