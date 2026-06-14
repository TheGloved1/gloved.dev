import { SiApple, SiDebian, SiFedora, SiLinux } from '@icons-pack/react-simple-icons';

export const RELEASE_EXTENSIONS = {
  Windows: ['msi', 'exe'],
  Mac: ['dmg'],
  Debian: ['deb'],
  Fedora: ['rpm'],
  Linux: ['AppImage', 'deb', 'rpm'],
} as const;

export type PlatformKey = keyof typeof RELEASE_EXTENSIONS;

export type GitHubRelease = {
  tag_name: string;
  name: string;
  published_at: string;
  html_url: string;
  body: string;
  prerelease: boolean;
  assets: {
    name: string;
    browser_download_url: string;
    content_type: string;
  }[];
};

export function findReleaseAssets(release: GitHubRelease) {
  const assets: Partial<Record<PlatformKey, { name: string; ext: string; url: string }[]>> = {};

  for (const platform of Object.keys(RELEASE_EXTENSIONS) as PlatformKey[]) {
    const exts = RELEASE_EXTENSIONS[platform];
    for (const ext of exts) {
      const asset = release.assets.find((a) => a.name.endsWith(`.${ext}`));
      if (asset) {
        (assets[platform] ??= []).push({ name: asset.name, ext, url: asset.browser_download_url });
      }
    }
  }

  return assets;
}

export function PlatformIcon({ platform, className }: { platform: string; className?: string }): React.JSX.Element {
  switch (platform) {
    case 'Windows':
      return (
        <svg className={className} viewBox='0 0 16 16' fill='currentColor'>
          <path d='M1.5 2.75l5.25-.71v5.46H1.5V2.75zM8 2.04l6.5-.88v6.16H8V2.04zM1.5 9.5h5.25v5.46l-5.25-.71V9.5zM8 9.5h6.5v6.16l-6.5-.88V9.5z' />
        </svg>
      );
    case 'Linux':
      return <SiLinux className={className} />;
    case 'Mac':
      return <SiApple className={className} />;
    case 'Debian':
      return <SiDebian className={className} />;
    case 'Fedora':
      return <SiFedora className={className} />;
    default:
      return <></>;
  }
}
