import * as cheerio from 'cheerio';
import { ParsedMovieListItem } from './movieParser';
import { isAnimeTitle } from '../utils/animeFilter';

export interface ParsedSearchResult {
  query: string;
  totalResults: number;
  movies: ParsedMovieListItem[];
}

function extractSlugFromUrl(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

function extractMovieItem($: cheerio.CheerioAPI, el: any, seen: Set<string>): ParsedMovieListItem | null {
  const $el = $(el);
  const link = $el.find('a[rel="bookmark"]').first();
  const href = $(link).attr('href') || '';
  if (!href || href === '#' || href.startsWith('javascript:')) return null;

  const title = $el.find('h2.entry-title a').text().trim() || $(link).text().trim() || $(link).attr('title') || '';
  if (!title) return null;

  const slug = extractSlugFromUrl(href);
  if (seen.has(slug)) return null;
  seen.add(slug);

  const img = $el.find('img').first();
  const posterUrl =
    img.attr('src') ||
    img.attr('data-src') ||
    img.attr('data-lazy-src') ||
    undefined;

  const ratingText = $el.find('.gmr-rating-item').text().trim() || '';
  const rating = ratingText ? parseFloat(ratingText.replace(/[^0-9.]/g, '')) || undefined : undefined;
  const quality = $el.find('.gmr-quality-item a').text().trim() || $el.find('.gmr-quality-item').text().trim() || undefined;

  const postType = $el.find('.gmr-posttype-item').first().text().trim();
  const isTv = postType.toLowerCase() === 'tv show' || href.includes('/tv/');
  const type: 'movie' | 'tv' | undefined = isTv ? 'tv' : 'movie';

  const numbeps = $el.find('.gmr-numbeps').first().text().trim();
  const episodeCount = numbeps ? numbeps.replace(/Eps:\s*/i, '').replace(/\s+/g, ' ').trim() : undefined;

  if (isAnimeTitle(title, slug)) return null;

  return { externalId: slug, title, slug, type, episodeCount, posterUrl, rating, quality };
}

export function parseSearchResults(html: string, query: string): ParsedSearchResult {
  const $ = cheerio.load(html);
  const movies: ParsedMovieListItem[] = [];
  const seen = new Set<string>();

  $('.gmr-item-modulepost, article.item-infinite, .item-article').each((_, el) => {
    const movie = extractMovieItem($, el, seen);
    if (movie) movies.push(movie);
  });

  const totalText = $('.page-title').text().trim() ||
    $('.search-count').text().trim() ||
    $('.result-count').text().trim() || '';
  const totalResults = totalText ? parseInt(totalText.replace(/\D/g, ''), 10) || movies.length : movies.length;

  return { query, totalResults, movies };
}
