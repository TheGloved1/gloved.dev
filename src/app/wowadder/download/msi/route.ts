// Required Route to download the latest msi for Microsoft Store
import { NextRequest, NextResponse } from 'next/server';
import { GitHubRelease, findReleaseAssets } from '../../_components/platform';

const Extensions = {
  Windows: 'msi',
  Mac: 'dmg',
  Linux: 'appimage',
  Debian: 'deb',
  Fedora: 'rpm',
};

export async function GET(_request: NextRequest) {
  try {
    const res = await fetch('https://api.github.com/repos/TheGloved1/WowAdder/releases/latest');
    if (!res.ok) {
      return NextResponse.error();
    }
    const release = (await res.json()) as GitHubRelease;
    const assets = findReleaseAssets(release);
    const platformAssets = assets['Windows' as keyof typeof assets] ?? [];
    const recommended = platformAssets.find((a) => a.ext === Extensions.Windows);
    const download = recommended ?? platformAssets[0];

    if (download) {
      // Fetch msi from download url
      const msiRes = await fetch(download.url);
      if (!msiRes.ok) {
        return NextResponse.error();
      }
      const msiBuffer = await msiRes.arrayBuffer();
      return new NextResponse(msiBuffer, {
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="WowAdder_${release.tag_name}_x64_en-US.msi"`,
        },
      });
    }

    return NextResponse.error();
  } catch {
    return NextResponse.error();
  }
}
