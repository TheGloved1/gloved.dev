import 'dotenv/config';
import { writeFileSync } from 'fs';
import { globby } from 'globby';

const addPage = (page) => {
  // remove unneeded segments of the page file path - for example: 'src/app/home/page.tsx' becomes '/home'
  let pathname = page.replace('src/app', '').replace('/page.tsx', '');
  // remove folder names that have parenthesis, so its just the nested routes
  pathname = pathname.replace(/\(.*?\)\//g, '');
  // ignore dynamic nextjs routes and other special dynamic stuff
  const ignore = [/\/\[\[.*\]\]/, /\[[a-zA-Z_][a-zA-Z_0-9]*\]/];

  if (ignore.some((pattern) => pattern.test(pathname))) {
    return '';
  }

  return `<url>
<loc>${`${process.env.WEBSITE_URL}${pathname}`}</loc>
<lastmod>${new Date().toISOString()}</lastmod>
</url>`;
};

const generateSitemap = async () => {
  // get all page paths in the app router
  const pages = await globby('src/app/**/page.tsx');

  // generate sitemap XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${pages.map(addPage).join('')}
</urlset>`;

  // write sitemap file to public folder - will be available at root url - for example: https://example.com/sitemap.xml
  writeFileSync('public/sitemap.xml', sitemap.replace(/\n/g, ''));
};

generateSitemap();
