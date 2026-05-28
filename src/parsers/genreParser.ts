import * as cheerio from 'cheerio';

export interface ParsedGenre {
  name: string;
  slug: string;
  movieCount?: number;
}

export function parseGenres(html: string): ParsedGenre[] {
  const $ = cheerio.load(html);
  const genres: ParsedGenre[] = [];

  $('#primary-menu li.menu-item-has-children').each((_, parent) => {
    const parentLink = $(parent).children('a').first().text().trim().toLowerCase();
    if (parentLink !== 'genre') return;

    $(parent).find('ul.sub-menu li.menu-item-object-category a').each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr('href') || '';
      const slug = href.replace(/\/$/, '').split('/').pop() || '';

      if (name && slug) {
        genres.push({ name, slug });
      }
    });
  });

  $('.gmr-category-list a, .gmr-genre-list a, .cat-item a, .genre-list a').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const slug = href.replace(/\/$/, '').split('/').pop() || '';

    if (name && slug) {
      genres.push({ name, slug });
    }
  });

  const seen = new Set<string>();
  return genres.filter((g) => {
    if (seen.has(g.slug)) return false;
    seen.add(g.slug);
    return true;
  });
}
