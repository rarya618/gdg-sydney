import type { APIRoute } from 'astro';

// Built into dist/robots.txt: every page may be crawled, and crawlers are pointed at the
// sitemap (src/pages/sitemap.xml.ts).
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('/sitemap.xml', site ?? 'https://gdgsydney.com').href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
