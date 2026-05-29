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

  const slug = href ? extractSlug(href) : title.toLowerCase().replace(/\s+/g, '-');

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
  const result: SokujaHomepage = {
    popularToday: [],
    latest: [],
    popularWeekly: [],
  };

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
      dayItems.push({
        title,
        slug,
        poster: poster?.startsWith('http') ? poster : null,
        time,
        episode,
      });
    });

    if (dayItems.length > 0) {
      result[dayHeading] = dayItems;
    }
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
    if (name) {
      genres.push({ name, slug, count });
    }
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
  const items = parseSokujaAnimeLists(html);
  return { query, items };
}
