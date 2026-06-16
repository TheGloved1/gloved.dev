import { NextRequest, NextResponse } from 'next/server';
import { GitHubRelease, findReleaseAssets, respondToDownload } from '../../../_components/platform';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ tag: string; ext: string }> },
): Promise<NextResponse> {
  const { tag, ext } = await params;
  const extLower = ext.toLowerCase();

  try {
    const res = await fetch(`https://api.github.com/repos/TheGloved1/WowAdder/releases/tags/${encodeURIComponent(tag)}`);
    if (!res.ok) {
      return NextResponse.json({ error: 'Release not found' }, { status: 404 });
    }
    const release = (await res.json()) as GitHubRelease;

    const assets = findReleaseAssets(release);
    const allAssets = Object.values(assets).flat();
    const asset = allAssets.find((a) => a.ext === extLower);

    if (!asset) {
      return NextResponse.json({ error: `No ${ext} asset found for release ${tag}` }, { status: 404 });
    }

    const result = await respondToDownload(asset, request);
    if (result) return result;

    return NextResponse.json({ error: 'Failed to download asset' }, { status: 502 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
