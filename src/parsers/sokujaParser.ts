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
  popularMonthly: SokujaAnimeItem[];
  popularAllTime: SokujaAnimeItem[];
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

  const titleEl = $el.find('.tt').first();
  const title = titleEl.text().trim() || img.attr('alt') || link.attr('title') || '';

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

function parsePopularSidebarItem($: cheerio.CheerioAPI, el: Element): SokujaAnimeItem {
  const $el = $(el);
  const link = $el.find('a.series').first();
  const href = link.attr('href') || '';

  const img = $el.find('img').first();
  const poster = img.attr('src') || img.attr('data-src') || null;
  const title = $el.find('h4 a.series').text().trim() || img.attr('alt') || '';

  const slug = href ? extractSlug(href) : title.toLowerCase().replace(/\s+/g, '-');

  let rating: number | null = null;
  const numscore = $el.find('.numscore').text().trim();
  if (numscore) {
    const parsed = parseFloat(numscore);
    if (!isNaN(parsed)) rating = parsed;
  }

  const genres: string[] = [];
  $el.find('span a[rel="tag"]').each((_, a) => {
    const g = $(a).text().trim();
    if (g) genres.push(g);
  });

  return {
    title,
    slug,
    poster: poster?.startsWith('http') ? poster : null,
    rating,
    quality: null,
    type: null,
    episode: null,
    year: null,
    genre: genres.length > 0 ? genres.join(', ') : null,
  };
}

export function parseSokujaHomepage(html: string): SokujaHomepage {
  const $ = cheerio.load(html);
  const result: SokujaHomepage = {
    popularToday: [],
    latest: [],
    popularWeekly: [],
    popularMonthly: [],
    popularAllTime: [],
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

  // fallback: find any listupd sections
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

  $('#wpop-items .serieslist.pop').each((_, el) => {
    const $list = $(el);
    if ($list.hasClass('wpop-weekly')) {
      $list.find('ul > li').each((_, li) => {
        const item = parsePopularSidebarItem($, li);
        if (item.title) result.popularWeekly.push(item);
      });
    }
    if ($list.hasClass('wpop-monthly') || $list.find(':scope').length) {
      // monthly tab content
    }
  });

  $('.wpop-weekly ul > li').each((_, li) => {
    if (result.popularWeekly.length === 0) {
      const item = parsePopularSidebarItem($, li);
      if (item.title) result.popularWeekly.push(item);
    }
  });

  return result;
}
