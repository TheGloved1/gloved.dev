#!/usr/bin/env tsx

import { readdirSync, statSync, writeFileSync } from 'fs';
import { extname, join, relative } from 'path';

interface RouteMap {
  [pagePath: string]: {
    relativePath: string;
    githubUrl: string;
  };
}

const APP_DIR = join(process.cwd(), 'src/app');
const GITHUB_BASE_URL = 'https://github.com/TheGloved1/gloved.dev/blob/master/src/app/';
const OUTPUT_FILE = join(process.cwd(), 'src/lib/route-map.ts');

function isDirectory(path: string): boolean {
  try {
    return statSync(path).isDirectory();
  } catch {
    return false;
  }
}

function findPageFiles(dir: string, baseDir: string = APP_DIR): string[] {
  const pageFiles: string[] = [];

  try {
    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);

      if (isDirectory(fullPath)) {
        // Skip directories that start with _ (private routes)
        if (!item.startsWith('_')) {
          pageFiles.push(...findPageFiles(fullPath, baseDir));
        }
      } else if (item === 'page.tsx') {
        pageFiles.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }

  return pageFiles;
}

function generatePagePath(filePath: string, baseDir: string): string {
  const relativePath = relative(baseDir, filePath);
  const pathWithoutExt = relativePath.replace(extname(relativePath), '');

  const pathWithoutPage = pathWithoutExt.replace(/[/\\]page$/, '');

  // Remove route group directories like (chat), (auth), etc.
  const cleanPath = pathWithoutPage.replace(/[/\\]\([^)]+\)/g, '');

  // Handle root page - if cleanPath is 'page' or empty, return '/'
  if (cleanPath === '' || cleanPath === 'page') {
    return '/';
  }

  const finalPath = `/${cleanPath.replace(/\\/g, '/')}`;
  return finalPath;
}

function generateGithubUrl(pagePath: string, relativePath: string): string {
  if (pagePath === '/') {
    return `${GITHUB_BASE_URL}page.tsx`;
  }

  // Remove the src/app/ prefix since it's already in GITHUB_BASE_URL
  // and convert backslashes to forward slashes for GitHub URLs
  let cleanPath = relativePath.replace(/\\/g, '/');
  if (cleanPath.startsWith('src/app/')) {
    cleanPath = cleanPath.substring(8); // Remove 'src/app/' (8 characters)
  }

  // URL encode the path to handle special characters like [ and ]
  const encodedPath = cleanPath
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `${GITHUB_BASE_URL}${encodedPath}`;
}

function generateRouteMap(): RouteMap {
  const pageFiles = findPageFiles(APP_DIR);
  const routeMap: RouteMap = {};

  console.log(`Found ${pageFiles.length} page files:`);

  for (const pageFile of pageFiles) {
    const pagePath = generatePagePath(pageFile, APP_DIR);
    const relativePath = relative(process.cwd(), pageFile);
    const githubUrl = generateGithubUrl(pagePath, relativePath);

    routeMap[pagePath] = {
      relativePath: relativePath.replace(/\\/g, '/'),
      githubUrl,
    };

    console.log(`  ${pagePath} -> ${relativePath}`);
  }

  return routeMap;
}

function generateTypeScriptFile(routeMap: RouteMap): string {
  const entries = Object.entries(routeMap)
    .map(([pagePath, info]) => {
      const escapedPath = pagePath.replace(/'/g, "\\'");
      return `    '${escapedPath}': {
      relativePath: '${info.relativePath}',
      githubUrl: '${info.githubUrl}'
    }`;
    })
    .join(',\n');

  // Extract dynamic route patterns from the route map
  const dynamicPatterns = Object.keys(routeMap)
    .filter((path) => path.includes('[') && path.includes(']'))
    .map((path) => {
      // Remove route groups like (chat), (auth) etc. BEFORE converting to regex
      const cleanPath = path.replace(/\/\([^)]+\)\//g, '/');

      // Convert template path to regex pattern
      let regexPattern = cleanPath
        .replace(/\[([^\]]+)\]/g, '([^/]+)') // Convert [param] to capture group
        .replace(/\//g, '\\/'); // Escape forward slashes

      // Remove /page from the end for matching actual URLs (like /chat/uuid instead of /chat/uuid/page)
      if (regexPattern.endsWith('\\/page')) {
        regexPattern = regexPattern.slice(0, -6) + '(?:\\/page)?';
      }

      return {
        pattern: new RegExp(`^${regexPattern}$`),
        templatePath: path,
        githubUrl: routeMap[path].githubUrl,
        relativePath: routeMap[path].relativePath,
      };
    });

  // Generate pattern matching code
  const patternMatchingCode = dynamicPatterns
    .map(({ pattern, templatePath, githubUrl, relativePath }) => {
      const regexString = pattern.toString();
      return `  // Pattern for ${templatePath}
  const match${templatePath.replace(/[^a-zA-Z0-9]/g, '_')} = pathname.match(${regexString});
  if (match${templatePath.replace(/[^a-zA-Z0-9]/g, '_')}) {
    return {
      relativePath: '${relativePath}',
      githubUrl: '${githubUrl}'
    };
  }`;
    })
    .join('\n\n');

  return `// Auto-generated route map for SourceCodeButton
// Do not edit this file directly - run the generate script instead

export interface RouteInfo {
  relativePath: string;
  githubUrl: string;
}

export const RouteMap: Record<string, RouteInfo> = {
${entries}
};

// Dynamic route pattern matching
function matchDynamicRoute(pathname: string): RouteInfo | undefined {
${patternMatchingCode}

  return undefined;
}

export function getRouteInfo(pagePath: string): RouteInfo | undefined {
  // First try exact match
  const exactMatch = RouteMap[pagePath];
  if (exactMatch) return exactMatch;

  // Then try dynamic pattern matching
  return matchDynamicRoute(pagePath);
}

export function getAllRoutes(): string[] {
  return Object.keys(RouteMap);
}
`;
}

function main() {
  console.log('🔍 Scanning for page.tsx files...');

  try {
    const routeMap = generateRouteMap();
    const typescriptContent = generateTypeScriptFile(routeMap);

    writeFileSync(OUTPUT_FILE, typescriptContent, 'utf-8');

    console.log(`✅ Generated route map with ${Object.keys(routeMap).length} routes`);
    console.log(`📁 Output file: ${OUTPUT_FILE}`);

    // Summary of route types
    const staticRoutes = Object.keys(routeMap).filter((path) => !path.includes('[') && !path.includes('...')).length;

    const dynamicRoutes = Object.keys(routeMap).length - staticRoutes;

    console.log(`📊 Summary: ${staticRoutes} static routes, ${dynamicRoutes} dynamic routes`);
  } catch (error) {
    console.error('❌ Error generating route map:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { generateRouteMap, generateTypeScriptFile };
