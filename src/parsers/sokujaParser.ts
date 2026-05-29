import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface SokujaAnimeItem {
  title: string;
  slug: string;
  poster: string | null;
  rating: number | null;
  quality: string | null;
  type: string | null;
  episode: string | null;
  year: number | null;
  genre: string | null;
}

export interface SokujaHomepage {
  popularToday: SokujaAnimeItem[];
  latest: SokujaAnimeItem[];
  popularWeekly: SokujaAnimeItem[];
}

export interface SokujaScheduleItem {
  title: string;
  slug: string;
  poster: string | null;
  time: string | null;
  episode: string | null;
}

export interface SokujaSchedule {
  [day: string]: SokujaScheduleItem[];
}

export interface SokujaGenreItem {
  name: string;
  slug: string;
  count: number;
}

export interface SokujaAnimeList {
  items: SokujaAnimeItem[];
}

export interface SokujaSearchResult {
  query: string;
  items: SokujaAnimeItem[];
}

export interface SokujaEpisodeItem {
  number: string;
  title: string;
  slug: string;
  date: string | null;
}

export interface SokujaCharacter {
  name: string;
  role: string;
  actor: { name: string; slug: string } | null;
}

export interface SokujaStreamServer {
  name: string;
  url: string;
  index: number;
}

export interface SokujaDownloadLink {
  quality: string;
  links: { provider: string; url: string }[];
}

export interface SokujaAnimeDetail {
  title: string;
  altTitles: string[];
  slug: string;
  poster: string | null;
  rating: number | null;
  status: string | null;
  studio: string | null;
  year: number | null;
  duration: string | null;
  season: string | null;
  type: string | null;
  episodeCount: string | null;
  fansub: string | null;
  director: string[];
  casts: string[];
  genres: { name: string; slug: string }[];
  synopsis: string | null;
  description: string | null;
  episodes: SokujaEpisodeItem[];
  characters: SokujaCharacter[];
  recommendations: SokujaAnimeItem[];
}

export interface SokujaEpisodeDetail {
  title: string;
  slug: string;
  seriesTitle: string;
  seriesSlug: string;
  episodeNumber: string | null;
  poster: string | null;
  rating: number | null;
  type: string | null;
  releaseDate: string | null;
  streamServers: SokujaStreamServer[];
  currentEmbed: string | null;
  downloads: SokujaDownloadLink[];
  prevEpisode: { title: string; slug: string } | null;
  nextEpisode: { title: string; slug: string } | null;
}

function extractSlug(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

function parseArticle($: cheerio.CheerioAPI, el: Element): SokujaAnimeItem {
  const $el = $(el);
  const link = $el.find('a[itemprop="url"]').first();
  const href = link.attr('href') || '';

  const img = $el.find('.limit img, img.ts-post-image').first();
  const poster = img.attr('src') || img.attr('data-src') || null;

  const titleEl = $el.find('.tt h2[itemprop="headline"]').first();
  const title = titleEl.text().trim() || $el.find('.tt').contents().first().text().trim() || img.attr('alt') || link.attr('title') || '';

  const epEl = $el.find('.epx').first();
  const episode = epEl.length ? epEl.text().trim() : null;

  const typeEl = $el.find('.typez').first();
  const type = typeEl.length ? typeEl.text().trim() : null;

  const slug = href ? extractSlug(href) : '';

  return {
    title,
    slug,
    poster: poster?.startsWith('http') ? poster : null,
    rating: null,
    quality: null,
    type,
    episode,
    year: null,
    genre: null,
  };
}

export function parseSokujaHomepage(html: string): SokujaHomepage {
  const $ = cheerio.load(html);
  const result: SokujaHomepage = { popularToday: [], latest: [], popularWeekly: [] };

  const popularSection = $('.releases.hothome').filter((_, el) =>
    $(el).text().trim().toLowerCase().includes('terpopuler')
  ).first().closest('.bixbox');

  if (popularSection.length) {
    popularSection.find('.listupd.popularslider .popconslide > article.bs').each((_, el) => {
      const item = parseArticle($, el);
      if (item.title) result.popularToday.push(item);
    });
  }

  const latestSection = $('.releases.latesthome').filter((_, el) =>
    $(el).text().trim().toLowerCase().includes('rilisan')
  ).first().closest('.bixbox');

  if (latestSection.length) {
    latestSection.find('.listupd.normal .excstf > article.bs').each((_, el) => {
      const item = parseArticle($, el);
      if (item.title) result.latest.push(item);
    });
  }

  if (result.popularToday.length === 0) {
    $('.listupd.popularslider article.bs').each((_, el) => {
      const item = parseArticle($, el);
      if (item.title) result.popularToday.push(item);
    });
  }
  if (result.latest.length === 0) {
    $('.listupd.normal article.bs').each((_, el) => {
      const item = parseArticle($, el);
      if (item.title) result.latest.push(item);
    });
  }

  $('.wpop-weekly ul > li').each((_, li) => {
    const $li = $(li);
    const link = $li.find('a.series').first();
    const href = link.attr('href') || '';
    const img = $li.find('img').first();
    const poster = img.attr('src') || null;
    const title = $li.find('h4 a.series').text().trim() || img.attr('alt') || '';
    if (!title) return;
    let rating: number | null = null;
    const ns = $li.find('.numscore').text().trim();
    if (ns) { const p = parseFloat(ns); if (!isNaN(p)) rating = p; }
    const slug = href ? extractSlug(href) : '';
    result.popularWeekly.push({
      title, slug,
      poster: poster?.startsWith('http') ? poster : null,
      rating, quality: null, type: null, episode: null, year: null, genre: null,
    });
  });

  return result;
}

export function parseSokujaSchedule(html: string): SokujaSchedule {
  const $ = cheerio.load(html);
  const result: SokujaSchedule = {};

  $('div.bixbox.schedulepage').each((_, section) => {
    const $section = $(section);
    const dayHeading = $section.find('.releases h3 span, .releases h3').first().text().trim();
    if (!dayHeading) return;

    const dayItems: SokujaScheduleItem[] = [];
    $section.find('.listupd > .bs').each((_, el) => {
      const $el = $(el);
      const link = $el.find('.bsx a').first();
      const href = link.attr('href') || '';
      const title = link.attr('title') || $el.find('.tt').text().trim() || '';
      if (!title || !href) return;
      const img = $el.find('.limit img').first();
      const poster = img.attr('src') || img.attr('data-src') || null;
      const timeEl = $el.find('.cndwn').first();
      const time = timeEl.length ? timeEl.text().trim() : null;
      const epEl = $el.find('.sb').first();
      const episode = epEl.length ? epEl.text().trim() : null;
      const slug = extractSlug(href);
      dayItems.push({ title, slug, poster: poster?.startsWith('http') ? poster : null, time, episode });
    });
    if (dayItems.length > 0) result[dayHeading] = dayItems;
  });

  return result;
}

export function parseSokujaGenreLists(html: string): SokujaGenreItem[] {
  const $ = cheerio.load(html);
  const genres: SokujaGenreItem[] = [];
  $('ul.taxindex li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').first();
    const href = link.attr('href') || '';
    const name = link.find('.name').text().trim();
    const countText = link.find('.count').text().trim();
    const count = countText ? parseInt(countText, 10) || 0 : 0;
    const slug = href ? extractSlug(href) : '';
    if (name) genres.push({ name, slug, count });
  });
  return genres;
}

export function parseSokujaAnimeLists(html: string): SokujaAnimeItem[] {
  const $ = cheerio.load(html);
  const items: SokujaAnimeItem[] = [];
  const seen = new Set<string>();
  $('article.bs').each((_, el) => {
    const item = parseArticle($, el);
    if (item.title && !seen.has(item.slug)) {
      seen.add(item.slug);
      items.push(item);
    }
  });
  return items;
}

export function parseSokujaSearch(html: string, query: string): SokujaSearchResult {
  return { query, items: parseSokujaAnimeLists(html) };
}

function decodeBase64(str: string): string {
  try {
    return Buffer.from(str, 'base64').toString('utf-8');
  } catch {
    return str;
  }
}

function extractIframeSrc(html: string): string | null {
  const match = html.match(/<IFRAME[^>]*SRC="([^"]+)"/i);
  return match ? match[1] : null;
}

export function parseSokujaAnimeDetail(html: string, slug: string): SokujaAnimeDetail {
  const $ = cheerio.load(html);
  const result: SokujaAnimeDetail = {
    title: '', altTitles: [], slug, poster: null, rating: null,
    status: null, studio: null, year: null, duration: null,
    season: null, type: null, episodeCount: null, fansub: null,
    director: [], casts: [], genres: [], synopsis: null, description: null,
    episodes: [], characters: [], recommendations: [],
  };

  result.title = $('.entry-title').first().text().trim() || slug;

  const img = $('.thumb img').first();
  result.poster = img.attr('src') || null;

  const ratingText = $('.rating strong').text().trim();
  if (ratingText) {
    const p = parseFloat(ratingText.replace(/[^0-9.]/g, ''));
    if (!isNaN(p)) result.rating = p;
  }

  $('.spe span').each((_, el) => {
    const text = $(el).text().trim();
    if (text.startsWith('Status:')) result.status = text.replace('Status:', '').trim();
    if (text.startsWith('Studio:')) result.studio = text.replace('Studio:', '').trim();
    if (text.startsWith('Dirilis:')) {
      const year = parseInt(text.replace('Dirilis:', '').trim(), 10);
      if (!isNaN(year)) result.year = year;
    }
    if (text.startsWith('Durasi:')) result.duration = text.replace('Durasi:', '').trim();
    if (text.startsWith('Season:')) result.season = text.replace('Season:', '').trim();
    if (text.startsWith('Tipe:')) result.type = text.replace('Tipe:', '').trim();
    if (text.startsWith('Episode:')) result.episodeCount = text.replace('Episode:', '').trim();
    if (text.startsWith('Fansub:')) result.fansub = text.replace('Fansub:', '').trim();
  });

  const altText = $('.alter').first().text().trim();
  if (altText) result.altTitles = altText.split(',').map(s => s.trim()).filter(Boolean);

  $('.genxed a').each((_, el) => {
    const name = $(el).text().trim();
    const gSlug = extractSlug($(el).attr('href') || '');
    if (name) result.genres.push({ name, slug: gSlug });
  });

  result.description = $('.desc').first().text().trim() || null;
  result.synopsis = $('.entry-content[itemprop="description"] p, .synp .entry-content p').first().text().trim() || null;

  $('.cvitem').each((_, el) => {
    const $el = $(el);
    const charName = $el.find('.charname').first().text().trim();
    const charRole = $el.find('.charrole').first().text().trim();
    const actorEl = $el.find('.cvactor .charname a').first();
    const actorName = actorEl.text().trim();
    const actorSlug = extractSlug(actorEl.attr('href') || '');
    if (charName) {
      result.characters.push({
        name: charName,
        role: charRole,
        actor: actorName ? { name: actorName, slug: actorSlug } : null,
      });
    }
  });

  $('.eplister ul li').each((_, el) => {
    const $el = $(el);
    const link = $el.find('a').first();
    const href = link.attr('href') || '';
    const num = $el.find('.epl-num').text().trim();
    const title = $el.find('.epl-title').text().trim();
    const date = $el.find('.epl-date').text().trim() || null;
    const epSlug = href ? extractSlug(href) : '';
    if (num && title) {
      result.episodes.push({ number: num, title, slug: epSlug, date });
    }
  });

  $('.listupd > article.bs').each((_, el) => {
    const item = parseArticle($, el);
    if (item.title && item.slug !== slug) result.recommendations.push(item);
  });

  return result;
}

export function parseSokujaEpisode(html: string): SokujaEpisodeDetail {
  const $ = cheerio.load(html);
  const result: SokujaEpisodeDetail = {
    title: '', slug: '', seriesTitle: '', seriesSlug: '',
    episodeNumber: null, poster: null, rating: null, type: null,
    releaseDate: null, streamServers: [], currentEmbed: null,
    downloads: [], prevEpisode: null, nextEpisode: null,
  };

  result.title = $('.entry-title').first().text().trim() || '';
  result.slug = extractSlug($('link[rel="canonical"]').attr('href') || '');

  const epNumMeta = $('meta[itemprop="episodeNumber"]').attr('content');
  result.episodeNumber = epNumMeta || null;

  const img = $('.tb img, .thumb img').first();
  result.poster = img.attr('src') || null;

  result.type = $('.epx').first().text().trim().replace(/\s+/g, ' ') || null;

  const dateText = $('.updated').first().text().trim();
  if (dateText) result.releaseDate = dateText;

  const ratingText = $('.rating strong').text().trim();
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

  const embedIframe = $('#embed_holder iframe, #pembed iframe').first();
  result.currentEmbed = embedIframe.attr('src') || null;

  $('.mirror option').each((_, el) => {
    const $opt = $(el);
    const value = $opt.attr('value') || '';
    const name = $opt.text().trim();
    const idx = parseInt($opt.attr('data-index') || '0', 10);
    if (!value || idx === 0) return;
    const decoded = decodeBase64(value);
    const src = extractIframeSrc(decoded);
    if (src) {
      result.streamServers.push({ name, url: src, index: idx });
    }
  });

  $('.soraddlx').each((_, el) => {
    const $el = $(el);
    const quality = $el.find('.sorattlx h3').text().trim() || 'Unknown';
    const dl: SokujaDownloadLink = { quality, links: [] };
    $el.find('.soraurlx').each((_, urlEl) => {
      const $urlEl = $(urlEl);
      $urlEl.find('a').each((_, aEl) => {
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
