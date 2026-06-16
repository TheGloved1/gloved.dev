import { NextRequest, NextResponse } from 'next/server';
import {
  GitHubRelease,
  PlatformKey,
  RECOMMENDED_EXT,
  findReleaseAssets,
  parsePlatform,
  respondToDownload,
} from '../../_components/platform';

export async function GET(request: NextRequest, { params }: { params: Promise<{ tag: string }> }): Promise<NextResponse> {
  const { tag } = await params;
  const { searchParams } = new URL(request.url);
  const userAgent = request.headers.get('user-agent') ?? '';
  const platform = parsePlatform(searchParams.get('platform'), userAgent);
  const extParam = searchParams.get('ext');

  try {
    const res = await fetch(`https://api.github.com/repos/TheGloved1/WowAdder/releases/tags/${encodeURIComponent(tag)}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }
    const release = (await res.json()) as GitHubRelease;
    const assets = findReleaseAssets(release);

    if (extParam) {
      const allAssets = Object.values(assets).flat();
      const byExt = allAssets.find((a) => a.ext.toLowerCase() === extParam.toLowerCase());
      if (byExt) {
        const result = await respondToDownload(byExt, request);
        if (result) return result;
      }
    }

    const platformAssets = assets[platform as PlatformKey] ?? [];
    const recommended = platformAssets.find((a) => a.ext === RECOMMENDED_EXT[platform as PlatformKey]);
    const download = recommended ?? platformAssets[0];

    if (download) {
      const result = await respondToDownload(download, request);
      if (result) return result;
    }

    return NextResponse.json({ error: `No compatible asset found for ${platform} in release ${tag}` }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
