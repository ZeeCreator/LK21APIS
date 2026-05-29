import * as cheerio from 'cheerio';

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
  hero: SokujaAnimeItem[];
  latest: SokujaAnimeItem[];
  ongoing: SokujaAnimeItem[];
  completed: SokujaAnimeItem[];
  popularWeekly: SokujaAnimeItem[];
  popularMonthly: SokujaAnimeItem[];
  popularAllTime: SokujaAnimeItem[];
  comments: { author: string; text: string; time: string }[];
}

function extractSlug(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

function extractAnimeItems($: cheerio.CheerioAPI, container: cheerio.Cheerio<any>): SokujaAnimeItem[] {
  const items: SokujaAnimeItem[] = [];
  const seen = new Set<string>();

  container.find('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href || href === '#' || href.startsWith('javascript:')) return;

    const img = $(el).find('img').first();
    const poster = img.attr('src') || img.attr('data-src') || null;
    const title = img.attr('alt') || $(el).attr('title') || '';

    if (!title) return;

    const slug = extractSlug(href);
    if (seen.has(slug)) return;
    seen.add(slug);

    items.push({
      title,
      slug,
      poster: poster?.startsWith('http') ? poster : null,
      rating: null,
      quality: null,
      type: null,
      episode: null,
      year: null,
      genre: null,
    });
  });

  return items;
}

export function parseSokujaHomepage(html: string): SokujaHomepage {
  const $ = cheerio.load(html);
  const result: SokujaHomepage = {
    hero: [],
    latest: [],
    ongoing: [],
    completed: [],
    popularWeekly: [],
    popularMonthly: [],
    popularAllTime: [],
    comments: [],
  };

  const sectionPatterns: { key: keyof SokujaHomepage; headings: string[] }[] = [
    { key: 'hero', headings: ['featured', 'hero', 'slider', 'trending'] },
    { key: 'latest', headings: ['update terbaru', 'latest', 'terbaru'] },
    { key: 'ongoing', headings: ['ongoing'] },
    { key: 'completed', headings: ['completed', 'selesai'] },
    { key: 'popularWeekly', headings: ['minggu ini', 'weekly', 'populer minggu'] },
    { key: 'popularMonthly', headings: ['bulan ini', 'monthly', 'populer bulan'] },
    { key: 'popularAllTime', headings: ['sepanjang masa', 'all time', 'populer semua'] },
  ];

  for (const section of sectionPatterns) {
    let container: cheerio.Cheerio<any> | null = null;

    for (const heading of section.headings) {
      container = $(`h2:contains("${heading}"), h3:contains("${heading}"), h1:contains("${heading}")`)
        .first()
        .parent();
      if (container.length > 0) break;

      container = $(`div:has(h2:contains("${heading}")), section:has(h2:contains("${heading}"))`).first();
      if (container.length > 0) break;
    }

    if (container && container.length > 0) {
      const items = extractAnimeItems($, container);
      if (section.key === 'hero') result.hero = items;
      else if (section.key === 'latest') result.latest = items;
      else if (section.key === 'ongoing') result.ongoing = items;
      else if (section.key === 'completed') result.completed = items;
      else if (section.key === 'popularWeekly') result.popularWeekly = items;
      else if (section.key === 'popularMonthly') result.popularMonthly = items;
      else if (section.key === 'popularAllTime') result.popularAllTime = items;
    }
  }

  if (result.hero.length === 0) {
    const heroContainer = $('[id*="hero"], [class*="hero"], [class*="slider"], [class*="carousel"]').first();
    if (heroContainer.length > 0) {
      result.hero = extractAnimeItems($, heroContainer);
    }
  }

  if (result.latest.length === 0) {
    const mainContent = $('main, .main-content, #content, article').first();
    if (mainContent.length > 0) {
      result.latest = extractAnimeItems($, mainContent);
    }
  }

  if (result.comments.length === 0) {
    $('[class*="comment"] li, [class*="comment"] div, [id*="comment"] li').each((_, el) => {
      const author = $(el).find('[class*="author"], [class*="name"]').first().text().trim();
      const text = $(el).find('[class*="text"], [class*="content"]').first().text().trim();
      const time = $(el).find('[class*="time"], [class*="date"], time').first().text().trim();
      if (author || text) {
        result.comments.push({ author, text, time });
      }
    });
  }

  return result;
}
