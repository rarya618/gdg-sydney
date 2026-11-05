import type { APIRoute } from 'astro';
import { speakers } from '../lib/devfest2026';

// Built at build time into dist/sitemap.xml. Static pages are discovered from src/pages,
// so a new page appears here without editing this file. Dynamic routes ([slug]) list
// their own paths below. URLs match the site's canonical form: no trailing slash
// (firebase.json sets trailingSlash: false), except the root.

const pageFiles = import.meta.glob('./**/*.astro');

function routeFromFile(file: string): string | null {
  if (file.includes('[')) return null; // dynamic routes are listed explicitly
  const route = file
    .replace(/^\.\//, '/')
    .replace(/\.astro$/, '')
    .replace(/\/index$/, '');
  return route === '/index' ? '/' : route || '/';
}

const staticRoutes = Object.keys(pageFiles)
  .map(routeFromFile)
  .filter((route): route is string => route !== null);

const dynamicRoutes = speakers.map((speaker) => `/devfest/2026/speakers/${speaker.slug}`);

export const GET: APIRoute = ({ site }) => {
  const base = site ?? new URL('https://gdgsydney.com');
  const urls = [...new Set([...staticRoutes, ...dynamicRoutes])]
    .sort((a, b) => (a === '/' ? -1 : b === '/' ? 1 : a.localeCompare(b)))
    .map((route) => `  <url><loc>${new URL(route, base).href}</loc></url>`)
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;

  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
};
