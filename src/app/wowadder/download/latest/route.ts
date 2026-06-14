import { NextRequest, NextResponse } from 'next/server';
import { GitHubRelease, findReleaseAssets } from '../../_components/platform';

const RECOMMENDED_EXT: Record<string, string> = {
  Windows: 'msi',
  Mac: 'dmg',
  Linux: 'appimage',
  Debian: 'deb',
  Fedora: 'rpm',
};

function detectPlatform(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Debian')) return 'Debian';
  if (userAgent.includes('Fedora')) return 'Fedora';
  return 'Windows';
}

function parsePlatform(raw: string | null, userAgent: string): string {
  if (raw) {
    const normalized = raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
    if (['Windows', 'Mac', 'Linux', 'Debian', 'Fedora'].includes(normalized)) return normalized;
  }
  return detectPlatform(userAgent);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userAgent = request.headers.get('user-agent') ?? '';
  const platform = parsePlatform(searchParams.get('platform'), userAgent);
  const extParam = searchParams.get('ext');

  try {
    const res = await fetch('https://api.github.com/repos/TheGloved1/WowAdder/releases/latest');
    if (!res.ok) {
      return NextResponse.redirect(new URL('/wowadder/download', request.url));
    }
    const release = (await res.json()) as GitHubRelease;
    const assets = findReleaseAssets(release);

    // If ext param given, search all assets for that extension
    if (extParam) {
      const allAssets = Object.values(assets).flat();
      const byExt = allAssets.find((a) => a.ext === extParam.toLowerCase());
      if (byExt) return NextResponse.redirect(byExt.url);
    }

    // Fall back to platform-based recommended
    const platformAssets = assets[platform as keyof typeof assets] ?? [];
    const recommended = platformAssets.find((a) => a.ext === RECOMMENDED_EXT[platform]);
    const download = recommended ?? platformAssets[0];

    if (download) {
      return NextResponse.redirect(download.url);
    }

    return NextResponse.redirect(new URL('/wowadder/download', request.url));
  } catch {
    return NextResponse.redirect(new URL('/wowadder/download', request.url));
  }
}
