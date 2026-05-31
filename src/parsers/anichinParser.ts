import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

export interface AnichinCardItem {
  title: string;
  slug: string;
  poster: string | null;
  type: string | null;
  episode: string | null;
  status: string | null;
}

export interface AnichinSliderItem {
  title: string;
  slug: string;
  backdrop: string | null;
  description: string | null;
  watchUrl: string | null;
}

export interface AnichinHomepage {
  slider: AnichinSliderItem[];
  popularToday: AnichinCardItem[];
  latestRelease: AnichinCardItem[];
}

export interface AnichinSeriesDetail {
  title: string;
  altTitles: string[];
  slug: string;
  poster: string | null;
  cover: string | null;
  rating: number | null;
  status: string | null;
  studio: string | null;
  network: string | null;
  type: string | null;
  season: string | null;
  country: string | null;
  duration: string | null;
  released: string | null;
  fansub: string | null;
  genres: { name: string; slug: string }[];
  synopsis: string | null;
  episodes: AnichinEpisodeItem[];
  downloads: AnichinDownloadBatch[];
}

export interface AnichinEpisodeItem {
  number: string;
  title: string;
  slug: string;
  date: string | null;
}

export interface AnichinDownloadBatch {
  title: string;
  qualities: AnichinQualityLink[];
}

export interface AnichinQualityLink {
  quality: string;
  links: { provider: string; url: string }[];
}

export interface AnichinStreamServer {
  name: string;
  embed: string;
  index: number;
}

export interface AnichinEpisodeDetail {
  title: string;
  slug: string;
  episodeNumber: string | null;
  poster: string | null;
  seriesTitle: string;
  seriesSlug: string;
  releaseDate: string | null;
  streamServers: AnichinStreamServer[];
  currentEmbed: string | null;
  downloads: AnichinDownloadBatch[];
  seriesInfo: {
    title: string;
    altTitles: string[];
    poster: string | null;
    rating: number | null;
    status: string | null;
    genres: { name: string; slug: string }[];
    synopsis: string | null;
  } | null;
  prevEpisode: { title: string; slug: string } | null;
  nextEpisode: { title: string; slug: string } | null;
}

export interface AnichinSeriesList {
  title: string;
  items: AnichinCardItem[];
  pagination: {
    current: number;
    total: number;
    next: number | null;
    prev: number | null;
  } | null;
}

export interface AnichinSearchResult {
  query: string;
  items: AnichinCardItem[];
}

function extractSlug(url: string): string {
  const clean = url.replace(/\/$/, '');
  return clean.split('/').pop() || '';
}

function parseCard($: cheerio.CheerioAPI, el: Element): AnichinCardItem | null {
  const $el = $(el);
  const $link = $el.find('.bsx > a').first();
  const href = $link.attr('href') || '';
  if (!href) return null;

  const slug = extractSlug(href);
  const poster = $el.find('.limit img').first().attr('src') || null;
  const $tt = $el.find('.tt').first();
  const title = $tt.contents().first().text().trim() || $tt.find('h2').first().text().trim() || '';
  const episode = $el.find('.epx').first().text().trim() || null;
  const type = $el.find('.typez').first().text().trim() || null;
  const statusEl = $el.find('.limit .status').first();
  const status = statusEl.length ? statusEl.text().trim() : null;

  if (!title) return null;
  return { title, slug, poster, type, episode, status };
}

export function parseAnichinHomepage(html: string): AnichinHomepage {
  const $ = cheerio.load(html);
  const slider: AnichinSliderItem[] = [];

  $('#slidertwo .swiper-slide.item').each((_, el) => {
    const $el = $(el);
    const $h2a = $el.find('.info h2 a');
    const href = $h2a.attr('href') || '';
    const title = $h2a.text().trim();
    const backdropStyle = $el.find('.backdrop').attr('style') || '';
    const backdropMatch = backdropStyle.match(/url\(['"]?(.*?)['"]?\)/);
    const backdrop = backdropMatch ? backdropMatch[1] : null;
    const description = $el.find('.info p').text().trim() || null;
    const watchUrl = $el.find('.info .watch').attr('href') || null;

    if (title && href) {
      slider.push({
        title,
        slug: extractSlug(href.replace('/seri/', '/')),
        backdrop,
        description,
        watchUrl,
      });
    }
  });

  const popularToday: AnichinCardItem[] = [];
  const latestRelease: AnichinCardItem[] = [];

  const bboxes = $('.bixbox.bbnofrm');
  if (bboxes.length >= 1) {
    const firstSection = $(bboxes[0]);
    firstSection.find('.listupd .excstf article.bs').each((_, el) => {
      const card = parseCard($, el);
      if (card) popularToday.push(card);
    });
  }

  if (bboxes.length >= 2) {
    const secondSection = $(bboxes[1]);
    secondSection.find('.listupd .excstf article.bs').each((_, el) => {
      const card = parseCard($, el);
      if (card) latestRelease.push(card);
    });
  }

  return { slider, popularToday, latestRelease };
}

export function parseAnichinSeriesDetail(html: string, slug: string): AnichinSeriesDetail {
  const $ = cheerio.load(html);
  const result: AnichinSeriesDetail = {
    title: '',
    altTitles: [],
    slug,
    poster: null,
    cover: null,
    rating: null,
    status: null,
    studio: null,
    network: null,
    type: null,
    season: null,
    country: null,
    duration: null,
    released: null,
    fansub: null,
    genres: [],
    synopsis: null,
    episodes: [],
    downloads: [],
  };

  result.title = $('h1.entry-title').first().text().trim() || slug;
  result.poster = $('.bixbox.animefull .thumb img').first().attr('src')
    || $('.thumb img.ts-post-image').first().attr('src') || null;
  result.cover = $('.bigcover .ime img').first().attr('src') || null;
  result.altTitles = $('.alter').first().text().trim().split(',').map(s => s.trim()).filter(Boolean);

  const ratingText = $('.rating strong').first().text().trim();
  if (ratingText) {
    const match = ratingText.match(/[\d.]+/);
    if (match) result.rating = parseFloat(match[0]);
  }

  $('.spe span').each((_, el) => {
    const $el = $(el);
    const $b = $el.find('b').first();
    const label = $b.text().trim().toLowerCase().replace(':', '');
    const value = $el.text().replace($b.text(), '').replace(':', '').trim();
    switch (label) {
      case 'status': result.status = value || null; break;
      case 'studio': result.studio = value || null; break;
      case 'network': result.network = value || null; break;
      case 'tipe': result.type = value || null; break;
      case 'type': result.type = value || null; break;
      case 'season': result.season = value || null; break;
      case 'country': result.country = value || null; break;
      case 'durasi': result.duration = value || null; break;
      case 'duration': result.duration = value || null; break;
      case 'dirilis':
      case 'released': if (!result.released) result.released = value || null; break;
      case 'fansub': result.fansub = value || null; break;
    }
  });

  $('.genxed a').each((_, el) => {
    const name = $(el).text().trim();
    const gSlug = extractSlug($(el).attr('href') || '');
    if (name) result.genres.push({ name, slug: gSlug });
  });

  const synopsisEl = $('.info-content .desc').first();
  result.synopsis = synopsisEl.text().trim() || null;

  if (!result.synopsis) {
    const entryContent = $('.entry-content p').first();
    result.synopsis = entryContent.text().trim() || null;
  }

  // Parse episode list from sidebar (old format)
  $('#singlepisode .episodelist ul li').each((_, el) => {
    const $el = $(el);
    const $a = $el.find('a').first();
    const href = $a.attr('href') || '';
    const epSlug = href ? extractSlug(href) : '';
    const epNumber = $el.find('.playinfo h4').first().text().trim();
    const infoText = $el.find('.playinfo span').first().text().trim() || '';
    const dateMatch = infoText.match(/(\w+\s+\d+,\s+\d+)/);
    const epDate = dateMatch ? dateMatch[1] : null;

    if (epSlug && epNumber) {
      result.episodes.push({
        number: epNumber.replace(/^Eps\s+/, ''),
        title: epNumber,
        slug: epSlug,
        date: epDate,
      });
    }
  });

  // Parse episode list from block_area format (new format)
  if (result.episodes.length === 0) {
    $('.block_area-episodes a.ep-item').each((_, el) => {
      const $a = $(el);
      const href = $a.attr('href') || '';
      const epSlug = href ? extractSlug(href) : '';
      const epNumber = $a.attr('data-number') || $a.find('.order').first().text().trim();

      if (epSlug && epNumber) {
        result.episodes.push({
          number: epNumber,
          title: `Episode ${epNumber}`,
          slug: epSlug,
          date: null,
        });
      }
    });
  }

  // Generate missing episode slugs from total count (i attribute)
  const totalEp = parseInt($('.episodes-ul').first().attr('i') || '0', 10);
  if (totalEp > result.episodes.length) {
    const existingNums = new Set(result.episodes.map(e => parseInt(e.number)));
    const lastSlug = result.episodes[result.episodes.length - 1]?.slug || '';

    for (let n = 1; n <= totalEp; n++) {
      if (!existingNums.has(n)) {
        const padded = String(n).padStart(2, '0');
        let genSlug = lastSlug
          .replace(/-\d{2}(?=-tamat-)/, `-${padded}`)
          .replace(/-\d{2}(?=-subtitle)/, `-${padded}`)
          .replace('-tamat', '');

        result.episodes.push({
          number: String(n),
          title: `Episode ${n}`,
          slug: genSlug,
          date: null,
        });
      }
    }

    result.episodes.sort((a, b) => parseInt(a.number) - parseInt(b.number));
  }

  // Parse batch downloads
  $('.mctnx .soraddlx.soradlg').each((_, section) => {
    const $section = $(section);
    const title = $section.find('.sorattlx h3').first().text().trim() || '';
    const qualities: AnichinQualityLink[] = [];

    $section.find('.soraurlx').each((_, qEl) => {
      const $qEl = $(qEl);
      const quality = $qEl.find('strong').first().text().trim();
      const links: { provider: string; url: string }[] = [];
      $qEl.find('a').each((_, aEl) => {
        const $a = $(aEl);
        links.push({
          provider: $a.text().trim(),
          url: $a.attr('href') || '',
        });
      });
      if (quality && links.length > 0) {
        qualities.push({ quality, links });
      }
    });

    if (qualities.length > 0) {
      result.downloads.push({ title, qualities });
    }
  });

  return result;
}

export function parseAnichinEpisode(html: string, slug: string): AnichinEpisodeDetail {
  const $ = cheerio.load(html);
  const result: AnichinEpisodeDetail = {
    title: '',
    slug,
    episodeNumber: null,
    poster: null,
    seriesTitle: '',
    seriesSlug: '',
    releaseDate: null,
    streamServers: [],
    currentEmbed: null,
    downloads: [],
    seriesInfo: null,
    prevEpisode: null,
    nextEpisode: null,
  };

  result.title = $('h1.entry-title').first().text().trim() || slug;

  const epNumEl = $('meta[itemprop="episodeNumber"]').first();
  result.episodeNumber = epNumEl.attr('content') || null;

  const posterImg = $('.tb img.wp-post-image').first();
  result.poster = posterImg.attr('src') || null;

  // Get series info from breadcrumb
  const breadcrumbLinks = $('.ts-breadcrumb a');
  breadcrumbLinks.each((_, el) => {
    const $el = $(el);
    const href = $el.attr('href') || '';
    if (href.includes('/seri/')) {
      result.seriesSlug = extractSlug(href);
      result.seriesTitle = $el.text().trim();
    }
  });

  // Fallback: get from year link
  if (!result.seriesSlug) {
    const seriesLink = $('.year a[href*="/seri/"]').first();
    const sHref = seriesLink.attr('href') || '';
    if (sHref) {
      result.seriesSlug = extractSlug(sHref);
      result.seriesTitle = seriesLink.text().trim();
    }
  }

  const updateDate = $('.updated').first().text().trim();
  if (updateDate) result.releaseDate = updateDate;

  // Current embed
  const iframe = $('#embed_holder iframe, #pembed iframe').first();
  result.currentEmbed = iframe.attr('src') || null;

  // Parse stream server options
  const seenServers = new Set<string>();
  $('select.mirror option').each((index, el) => {
    const $el = $(el);
    const name = $el.text().trim();
    if (!name || name === 'Select Video Server') return;
    const b64 = $el.attr('value') || '';
    if (!b64) return;

    try {
      const decoded = atob(b64);
      const srcMatch = decoded.match(/src=["'](.*?)["']/);
      if (srcMatch) {
        const embedUrl = srcMatch[1];
        const key = name + embedUrl;
        if (!seenServers.has(key)) {
          seenServers.add(key);
          result.streamServers.push({
            name,
            embed: embedUrl,
            index: index,
          });
        }
      }
    } catch {
      // skip invalid base64
    }
  });

  // Series info sidebar
  const seriesInfoBox = $('.single-info.bixbox');
  if (seriesInfoBox.length) {
    const infoBox = seriesInfoBox.first();
    const genres: { name: string; slug: string }[] = [];
    infoBox.find('.genxed a').each((_, el) => {
      const name = $(el).text().trim();
      const gSlug = extractSlug($(el).attr('href') || '');
      if (name) genres.push({ name, slug: gSlug });
    });

    const ratingText = infoBox.find('.rating strong').first().text().trim();
    let rating: number | null = null;
    if (ratingText) {
      const match = ratingText.match(/[\d.]+/);
      if (match) rating = parseFloat(match[0]);
    }

    result.seriesInfo = {
      title: infoBox.find('.infolimit h2').first().text().trim() || result.seriesTitle,
      altTitles: [],
      poster: infoBox.find('.thumb img').first().attr('src') || result.poster,
      rating,
      status: null,
      genres,
      synopsis: infoBox.find('.desc.mindes').first().text().trim() || null,
    };

    infoBox.find('.spe span').each((_, el) => {
      const $el = $(el);
      const $b = $el.find('b').first();
      const label = $b.text().trim().toLowerCase().replace(':', '');
      const value = $el.text().replace($b.text(), '').replace(':', '').trim();
      if (label === 'status' && result.seriesInfo) result.seriesInfo.status = value || null;
    });
  }

  // Parse downloads
  $('.mctnx .soraddlx.soradlg').each((_, section) => {
    const $section = $(section);
    const dTitle = $section.find('.sorattlx h3').first().text().trim() || '';
    const qualities: AnichinQualityLink[] = [];

    $section.find('.soraurlx').each((_, qEl) => {
      const $qEl = $(qEl);
      const quality = $qEl.find('strong').first().text().trim();
      const links: { provider: string; url: string }[] = [];
      $qEl.find('a').each((_, aEl) => {
        const $a = $(aEl);
        links.push({
          provider: $a.text().trim(),
          url: $a.attr('href') || '',
        });
      });
      if (quality && links.length > 0) {
        qualities.push({ quality, links });
      }
    });

    if (qualities.length > 0) {
      result.downloads.push({ title: dTitle, qualities });
    }
  });

  // Prev/Next
  const prevLink = $('.naveps .nvs a[rel="prev"]').first();
  if (prevLink.length) {
    const prevHref = prevLink.attr('href') || '';
    result.prevEpisode = { title: 'Previous Episode', slug: extractSlug(prevHref) };
  }

  const nextLink = $('.naveps .nvs a[rel="next"]').first();
  if (nextLink.length) {
    const nextHref = nextLink.attr('href') || '';
    result.nextEpisode = { title: 'Next Episode', slug: extractSlug(nextHref) };
  }

  return result;
}

export function parseAnichinSeriesList(html: string, title: string): AnichinSeriesList {
  const $ = cheerio.load(html);
  const items: AnichinCardItem[] = [];

  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) items.push(card);
  });

  let pagination: AnichinSeriesList['pagination'] = null;
  const currentEl = $('.pagination .page-numbers.current').first();
  if (currentEl.length) {
    const current = parseInt(currentEl.text().trim(), 10) || 1;
    const allPages: number[] = [];
    $('.pagination .page-numbers:not(.dots):not(.next):not(.prev)').each((_, el) => {
      const num = parseInt($(el).text().trim(), 10);
      if (!isNaN(num)) allPages.push(num);
    });
    const total = allPages.length > 0 ? Math.max(...allPages) : 1;

    const nextEl = $('.pagination .next.page-numbers').first();
    const prevEl = $('.pagination .prev.page-numbers').first();

    pagination = {
      current,
      total,
      next: nextEl.length ? current + 1 : null,
      prev: prevEl.length ? current - 1 : null,
    };
  }

  const hpageNext = $('.hpage a.r').first();
  if (!pagination && hpageNext.length) {
    const href = hpageNext.attr('href') || '';
    const pageMatch = href.match(/[?&]page=(\d+)/);
    const current = pageMatch ? parseInt(pageMatch[1], 10) - 1 : 1;
    pagination = {
      current,
      total: current + 1,
      next: current + 1,
      prev: current > 1 ? current - 1 : null,
    };
  }

  return { title, items, pagination };
}

export function parseAnichinSearch(html: string, query: string): AnichinSearchResult {
  const $ = cheerio.load(html);
  const items: AnichinCardItem[] = [];

  $('.listupd article.bs').each((_, el) => {
    const card = parseCard($, el);
    if (card) items.push(card);
  });

  return { query, items };
}
