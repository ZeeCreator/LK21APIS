import * as cheerio from 'cheerio';

export interface ParsedCountry {
  name: string;
  slug: string;
  movieCount?: number;
}

export function parseCountries(html: string): ParsedCountry[] {
  const $ = cheerio.load(html);
  const countries: ParsedCountry[] = [];

  $('#primary-menu li.menu-item-has-children').each((_, parent) => {
    const parentLink = $(parent).children('a').first().text().trim().toLowerCase();
    if (parentLink !== 'country') return;

    $(parent).find('ul.sub-menu li.menu-item-object-muvicountry a').each((_, el) => {
      const name = $(el).text().trim();
      const href = $(el).attr('href') || '';
      const slug = href.replace(/\/$/, '').split('/').pop() || '';

      if (name && slug) {
        countries.push({ name, slug });
      }
    });
  });

  $('.gmr-country-list a, .country-list a, .country a, .cat-item a').each((_, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr('href') || '';
    const slug = href.replace(/\/$/, '').split('/').pop() || '';

    if (name && slug) {
      countries.push({ name, slug });
    }
  });

  const seen = new Set<string>();
  return countries.filter((c) => {
    if (seen.has(c.slug)) return false;
    seen.add(c.slug);
    return true;
  });
}
