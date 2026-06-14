export const RELEASE_EXTENSIONS = {
  Windows: ['msi', 'exe'],
  Linux: ['deb', 'rpm', 'AppImage'],
  Mac: ['dmg'],
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
      return (
        <svg className={className} viewBox='0 0 16 16' fill='currentColor'>
          <path d='M8 1C6.34 1 5 2.34 5 4c0 .56.14 1.09.38 1.56C4.1 6.44 3.22 8.06 3.22 10c0 2.2 1.8 4 4 4h1.56c2.2 0 4-1.8 4-4 0-1.94-.88-3.56-2.16-4.44.24-.47.38-1 .38-1.56 0-1.66-1.34-3-3-3z' />
        </svg>
      );
    case 'Mac':
      return (
        <svg className={className} viewBox='0 0 16 16' fill='currentColor'>
          <path d='M11.6 8.3c0-2.3 1.3-3 1.3-3s-1-1.3-2.3-1.3c-1 0-1.7.5-2.3.5s-1.3-.5-2.3-.5C4.7 4 3.7 5.3 3.7 5.3s1.3.7 1.3 3-1.3 2.7-1.3 2.7 1 1.3 2.3 1.3c1 0 1.3-.5 2.3-.5s1.3.5 2.3.5c1.3 0 2.3-1.3 2.3-1.3s-1.3-.4-1.3-2.7zM9.3 2.7c.7 0 1.3-.7 1.3-1.3s-.7-.7-1.3 0-.7 1.3 0 1.3z' />
        </svg>
      );
    default:
      return <></>;
  }
}
