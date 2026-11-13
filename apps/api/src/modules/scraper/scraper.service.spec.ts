import { describe, it, expect, beforeEach } from 'vitest';
import { ScraperService } from './scraper.service.js';

describe('ScraperService', () => {
  let scraperService: ScraperService;

  beforeEach(() => {
    scraperService = new ScraperService();
  });

  it('should be defined', () => {
    expect(scraperService).toBeDefined();
  });

  it('should detect YouTube video URLs and return video resource type', async () => {
    const result = await scraperService.scrapeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    expect(result.resourceType).toBe('video');
    expect(result.siteName).toBe('YouTube');
    expect(result.thumbnailUrl).toContain('dQw4w9WgXcQ');
  });

  it('should gracefully handle invalid URLs with fallback metadata', async () => {
    const result = await scraperService.scrapeUrl('https://non-existent-domain-12345.xyz');
    expect(result.resourceType).toBe('general');
    expect(result.title).toBe('non-existent-domain-12345.xyz');
    expect(result.faviconUrl).toContain('non-existent-domain-12345.xyz');
  });
});

