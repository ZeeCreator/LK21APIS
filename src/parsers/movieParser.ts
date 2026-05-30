import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';
import { parseServerTabs } from './watchParser';
import { rankSources } from '../services/embedRanker';
import { isAnimeTitle } from '../utils/animeFilter';

type CheerioElement = Element;

export interface ParsedWatchSource {
  url: string;
  server?: string;
  isEmbed?: boolean;
}

export interface ParsedDownloadLink {
  url: string;
  provider?: string;
}

export interface ParsedMovie {
  externalId: string;
  title: string;
  slug: string;
  type?: 'movie' | 'tv';
  titleEn?: string;
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  year?: number;
  rating?: number;
  duration?: string;
  quality?: string;
  status?: string;
  country?: string;
  genres: string[];
  releaseDate?: string;
  episodeCount?: string;
  episodes?: ParsedEpisode[];
  watchSources?: ParsedWatchSource[];
  downloadLinks?: ParsedDownloadLink[];
}

export interface ParsedEpisode {
  title: string;
  slug: string;
  episode?: string;
}

export interface ParsedMovieListItem {
  externalId: string;
  title: string;
  slug: string;
  type?: 'movie' | 'tv';
  episodeCount?: string;
  posterUrl?: string;
  year?: number;
  rating?: number;
  quality?: string;
}

function extractSlugFromUrl(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

export function parseEpisodeDetail(html: string, slug: string): ParsedMovie {
  const $ = cheerio.load(html);

  const title = $('h1.entry-title').first().text().trim() || $('h1').first().text().trim() || '';
  const externalId = $('[data-id]').attr('data-id') || $('.gmr-single-id').text().trim() || slug;

  const posterUrl =
    $('meta[property="og:image"]').first().attr('content') ||
    $('.gmr-thumbnail-single img').first().attr('src') ||
    $('img[itemprop="image"]').first().attr('src') ||
    undefined;

  const description =
    $('.gmr-content p').first().text().trim() ||
    $('.entry-content p').first().text().trim() ||
    undefined;

  let quality: string | undefined = undefined;
  let releaseDate: string | undefined = undefined;
  $('.content-moviedata .gmr-moviedata').each((_, el) => {
    const label = $(el).find('strong').text().trim().replace(':', '');
    const value = $(el).find('a').first().text().trim() || $(el).text().replace(/[^:]*:\s*/i, '').trim();
    if (label === 'Kualitas') quality = value || undefined;
    if (label === 'Rilis') releaseDate = value || undefined;
  });

  const watchSources: ParsedWatchSource[] = [];
  $('.gmr-embed-responsive iframe').each((_, el) => {
    const url = $(el).attr('src') || '';
    if (url) watchSources.push({ url, server: 'iframe', isEmbed: true });
  });
  const serverTabs = parseServerTabs(html);
  for (const tab of serverTabs) {
    watchSources.push({ url: tab.pageUrl, server: tab.name, isEmbed: false });
  }

  const ranked = rankSources(watchSources.filter((s) => s.isEmbed));
  const blocked = new Set(ranked.filter((s) => s.blocked).map((s) => new URL(s.url).hostname));
  const idx = watchSources.findIndex((s) => {
    try { return s.isEmbed && blocked.has(new URL(s.url).hostname); } catch { return false; }
  });
  if (idx >= 0) watchSources.splice(idx, 1);

  const downloadLinks: ParsedDownloadLink[] = [];
  $('.gmr-download-wrap .gmr-download-list li a').each((_, el) => {
    const url = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const provider = $(el).attr('title')?.replace(/^Link Download \d+\s*/i, '').trim() || undefined;
    if (url) downloadLinks.push({ url, provider: provider || text || undefined });
  });

  const episodes: ParsedEpisode[] = [];
  $('.gmr-listseries a').each((_, el) => {
    const text = $(el).text().trim();
    if (text === 'Lihat Semua Episode') return;
    const href = $(el).attr('href') || '';
    const rawTitle = $(el).attr('title') || text;
    const epsTitle = rawTitle.replace(/^Permalink\s+(ke\s+)?[:.\s]*/i, '').trim() || text;
    const epsSlug = extractSlugFromUrl(href);
    if (epsSlug && epsTitle && !href.includes('javascript:')) {
      episodes.push({ title: epsTitle, slug: epsSlug, episode: text || undefined });
    }
  });

  return {
    externalId,
    title,
    slug,
    type: 'tv',
    description,
    posterUrl,
    quality,
    releaseDate,
    genres: [],
    episodes: episodes.length > 0 ? episodes : undefined,
    watchSources: watchSources.length > 0 ? watchSources : undefined,
    downloadLinks: downloadLinks.length > 0 ? downloadLinks : undefined,
  };
}

export function parseMovieDetail(html: string): ParsedMovie {
  const $ = cheerio.load(html);

  const $main = $('article').first();

  const title = $main.find('h1.entry-title').first().text().trim() || $('h1').first().text().trim() || '';
  const canonical = $('link[rel="canonical"]').attr('href') || '';
  const slug = extractSlugFromUrl(canonical);

  const externalId =
    $('[data-id]').attr('data-id') || $('.gmr-single-id').text().trim() || slug;

  const posterThumb = $main.find('figure.pull-left img').first().attr('src') || '';
  const posterUrl =
    $('meta[property="og:image"]').first().attr('content') ||
    $('.gmr-thumbnail-single img').first().attr('src') ||
    $('.poster img').attr('src') ||
    posterThumb.replace(/-60x90/, '') ||
    $main.find('img[itemprop="image"]').first().attr('src') ||
    undefined;

  const description =
    $main.find('.gmr-content p').first().text().trim() ||
    $main.find('.entry-content p').first().text().trim() ||
    $('.sinopsis').text().trim() ||
    $('.gmr-sinopsis').text().trim() ||
    undefined;

  let rating: number | undefined = undefined;
  const ratingBarStyle = $('.gmr-rating-bar span').first().attr('style') || '';
  const widthMatch = ratingBarStyle.match(/width\s*:\s*(\d+(?:\.\d+)?)%/);
  if (widthMatch) {
    rating = parseFloat(widthMatch[1]) / 10;
  } else {
    const $ratingEl = $main.find('.gmr-rating-item').first();
    const ratingText = $ratingEl.text().trim() || '';
    rating = ratingText ? parseFloat(ratingText.replace(/[^0-9.]/g, '')) || undefined : undefined;
  }

  let quality: string | undefined = undefined;
  $('.content-moviedata .gmr-moviedata').each((_, el) => {
    const label = $(el).find('strong').text().trim().replace(':', '');
    if (label === 'Kualitas') {
      quality = $(el).find('a').first().text().trim() || $(el).text().replace(/Kualitas[:\s]*/i, '').trim() || undefined;
    }
  });
  if (!quality) {
    quality = $main.find('.gmr-quality-item a').first().text().trim() || $main.find('.gmr-quality-item').first().text().trim() || undefined;
  }

  let duration: string | undefined = undefined;
  const durEl = $('[property="duration"]').first();
  duration = durEl.text().trim() || undefined;
  if (!duration) {
    const $durationEl = $main.find('.gmr-duration-item').first();
    duration = $durationEl.text().trim().replace(/svg[\s\S]*/, '').replace(/[^0-9\smin]/g, '').trim() || undefined;
  }

  let year: number | undefined = undefined;
  $('.content-moviedata .gmr-moviedata').each((_, el) => {
    const label = $(el).find('strong').text().trim().replace(':', '');
    if (label === 'Tahun') {
      const yearLink = $(el).find('a').first().text().trim();
      if (yearLink) year = parseInt(yearLink.replace(/\D/g, ''), 10) || undefined;
    }
  });
  if (!year) {
    const yearText = $main.find('.gmr-year-item').first().text().trim() || $('.year').first().text().trim() || '';
    year = yearText ? parseInt(yearText.replace(/\D/g, ''), 10) || undefined : undefined;
  }

  let country: string | undefined = undefined;
  $('.content-moviedata .gmr-moviedata').each((_, el) => {
    const label = $(el).find('strong').text().trim().replace(':', '');
    if (label === 'Negara') {
      country = $(el).find('a').first().text().trim() || undefined;
    }
  });
  if (!country) {
    const $countryEl = $main.find('.gmr-country-item a').first();
    country = $countryEl.text().trim() || undefined;
  }

  const genres: string[] = [];
  $('.content-moviedata .gmr-moviedata').each((_, el) => {
    const label = $(el).find('strong').text().trim().replace(':', '');
    if (label === 'Genre') {
      $(el).find('a').each((_, a) => {
        const genre = $(a).text().trim();
        if (genre) genres.push(genre);
      });
    }
  });
  if (genres.length === 0) {
    const $movieOn = $main.find('.gmr-movie-on').first();
    $movieOn.children('a').each((_, el) => {
      const genre = $(el).text().trim().replace(/,/g, '').trim();
      if (genre) genres.push(genre);
    });
  }

  const titleEn = $('.original-title').text().trim() || $('.title-en').text().trim() || undefined;
  const status = $main.find('.gmr-status-item').first().text().trim() || $('.status').first().text().trim() || undefined;

  const releaseDate = $('[itemprop="dateCreated"]').first().attr('datetime') || undefined;

  const isTv = canonical.includes('/tv/');
  const movieType: 'movie' | 'tv' = isTv ? 'tv' : 'movie';

  let episodeCount: string | undefined = undefined;
  const numbeps = $('.gmr-numbeps').first().text().trim();
  if (numbeps) {
    episodeCount = numbeps.replace(/Eps:\s*/i, '').replace(/\s+/g, ' ').trim() || undefined;
  }

  const episodes: ParsedEpisode[] = [];
  $('.gmr-listseries a').each((_, el) => {
    const text = $(el).text().trim();
    if (text === 'Lihat Semua Episode') return;
    const href = $(el).attr('href') || '';
    const rawTitle = $(el).attr('title') || text;
    const title = rawTitle.replace(/^Permalink\s+(ke\s+)?[:.\s]*/i, '').trim() || text;
    const slug = extractSlugFromUrl(href);
    if (slug && title && !href.includes('javascript:')) {
      episodes.push({ title, slug, episode: text || undefined });
    }
  });

  const watchSources: ParsedWatchSource[] = [];
  $('.gmr-embed-responsive iframe').each((_, el) => {
    const url = $(el).attr('src') || '';
    if (url) watchSources.push({ url, server: 'iframe', isEmbed: true });
  });
  const serverTabs = parseServerTabs(html);
  for (const tab of serverTabs) {
    watchSources.push({ url: tab.pageUrl, server: tab.name, isEmbed: false });
  }

  const ranked = rankSources(watchSources.filter((s) => s.isEmbed));
  const blocked = new Set(ranked.filter((s) => s.blocked).map((s) => new URL(s.url).hostname));
  const idx = watchSources.findIndex((s) => {
    try { return s.isEmbed && blocked.has(new URL(s.url).hostname); } catch { return false; }
  });
  if (idx >= 0) watchSources.splice(idx, 1);

  const downloadLinks: ParsedDownloadLink[] = [];
  $('.gmr-download-wrap .gmr-download-list li a').each((_, el) => {
    const url = $(el).attr('href') || '';
    const text = $(el).text().trim();
    const provider = $(el).attr('title')?.replace(/^Link Download \d+\s*/i, '').trim() || undefined;
    if (url) downloadLinks.push({ url, provider: provider || text || undefined });
  });

  return {
    externalId,
    title,
    slug,
    type: movieType,
    titleEn,
    description,
    posterUrl,
    year,
    rating,
    duration,
    quality,
    status,
    country,
    genres,
    releaseDate,
    episodeCount,
    episodes: episodes.length > 0 ? episodes : undefined,
    watchSources: watchSources.length > 0 ? watchSources : undefined,
    downloadLinks: downloadLinks.length > 0 ? downloadLinks : undefined,
  };
}

export function parseMovieList(html: string): ParsedMovieListItem[] {
  const $ = cheerio.load(html);
  const movies: ParsedMovieListItem[] = [];
  const seen = new Set<string>();

  function addMovie(el: CheerioElement) {
    const link =
      $(el).find('a[rel="bookmark"]').first() ||
      $(el).find('a').first();

    const href = $(link).attr('href') || '';
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    const title =
      $(el).find('h2.entry-title a').text().trim() ||
      $(el).find('.gmr-slide-title a').text().trim() ||
      $(link).attr('title') ||
      $(link).find('img').attr('alt') ||
      '';

    if (!title) return;

    const slug = extractSlugFromUrl(href);
    const externalId = slug;

    if (seen.has(slug)) return;
    seen.add(slug);

    const img = $(el).find('img').first();
    const posterUrl =
      img.attr('src') ||
      img.attr('data-src') ||
      img.attr('data-lazy-src') ||
      img.attr('srcset')?.split(' ')[0] ||
      undefined;

    const ratingText = $(el).find('.gmr-rating-item').text().trim() || '';
    const rating = ratingText ? parseFloat(ratingText.replace(/[^0-9.]/g, '')) || undefined : undefined;
    const quality = $(el).find('.gmr-quality-item a').text().trim() || $(el).find('.gmr-quality-item').text().trim() || undefined;

    const postType = $(el).find('.gmr-posttype-item').first().text().trim();
    const isTv = postType.toLowerCase() === 'tv show' || href.includes('/tv/');
    const type: 'movie' | 'tv' | undefined = isTv ? 'tv' : 'movie';

    const numbeps = $(el).find('.gmr-numbeps').first().text().trim();
    const episodeCount = numbeps ? numbeps.replace(/Eps:\s*/i, '').replace(/\s+/g, ' ').trim() : undefined;

    if (isAnimeTitle(title, slug, href)) return;

    movies.push({ externalId, title, slug, type, episodeCount, posterUrl, rating, quality });
  }

  $('.gmr-item-modulepost').each((_, el) => addMovie(el));

  $('.gmr-slider-content').each((_, el) => addMovie(el));

  $('.item-infinite').each((_, el) => addMovie(el));

  return movies;
}
