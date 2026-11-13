import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';

export interface ScrapedMetadata {
  url: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  faviconUrl?: string;
  siteName?: string;
  resourceType: 'article' | 'video' | 'book' | 'code' | 'general';
}

@Injectable()
export class ScraperService {
  private readonly logger = new Logger(ScraperService.name);

  async scrapeUrl(url: string): Promise<ScrapedMetadata> {
    const parsedUrl = new URL(url);

    // YouTube detection
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
      return this.handleYouTube(url);
    }

    // Default Universal Open Graph Scraper
    return this.handleUniversal(url);
  }

  private async handleYouTube(url: string): Promise<ScrapedMetadata> {
    const videoIdMatch = url.match(/(?:v=|\/)([0-9A-Za-z_-]{11}).*/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    return {
      url,
      title: 'YouTube Video',
      description: 'Saved video resource from YouTube',
      thumbnailUrl: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : undefined,
      faviconUrl: 'https://www.youtube.com/s/desktop/favicon.ico',
      siteName: 'YouTube',
      resourceType: 'video',
    };
  }

  private async handleUniversal(url: string): Promise<ScrapedMetadata> {
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 ArcivoArchiver/1.0',
        },
        timeout: 8000,
      });

      const $ = cheerio.load(response.data);

      const title =
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        'Archived Webpage';

      const description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        '';

      const thumbnailUrl =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        undefined;

      const parsed = new URL(url);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`;

      return {
        url,
        title: title.trim(),
        description: description.trim(),
        thumbnailUrl,
        faviconUrl,
        siteName: $('meta[property="og:site_name"]').attr('content') || parsed.hostname,
        resourceType: 'article',
      };
    } catch (error) {
      this.logger.warn(`Failed to scrape ${url}: ${(error as Error).message}`);
      const parsed = new URL(url);
      return {
        url,
        title: parsed.hostname,
        description: 'Web resource saved without live metadata',
        faviconUrl: `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=128`,
        siteName: parsed.hostname,
        resourceType: 'general',
      };
    }
  }
}

