import { spawn } from 'child_process';
import { existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'fs';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { platform } from 'os';

const CACHE_DIR = join(dirname(fileURLToPath(import.meta.url)), '.cache', 'gource');
const GOURCE_ZIP_URL = 'https://github.com/acaudwell/Gource/releases/download/gource-0.53/gource-0.53.win64.zip';

function isWindows(): boolean {
  return platform() === 'win32';
}

async function findGourceExe(): Promise<string | null> {
  if (existsSync(CACHE_DIR)) {
    const cached = findFileRecursive(CACHE_DIR, 'gource.exe');
    if (cached) return cached;
  }

  if (!isWindows()) return null;

  return downloadAndExtractGource();
}

async function downloadAndExtractGource(): Promise<string | null> {
  rmSync(CACHE_DIR, { recursive: true, force: true });
  mkdirSync(CACHE_DIR, { recursive: true });

  const zipPath = join(CACHE_DIR, 'gource.zip');

  try {
    const resp = await fetch(GOURCE_ZIP_URL);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    writeFileSync(zipPath, Buffer.from(await resp.arrayBuffer()));

    await extractZip(zipPath, CACHE_DIR);

    const found = findFileRecursive(CACHE_DIR, 'gource.exe');
    if (!found) throw new Error('gource.exe not found in extracted archive');

    rmSync(zipPath, { force: true });

    return found;
  } catch (err) {
    console.error(`Failed to download/extract gource: ${err}`);
    return null;
  }
}

function extractZip(zipPath: string, destDir: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ps = spawn('powershell', [
      '-NoProfile',
      '-Command',
      `Expand-Archive -Path '${zipPath}' -DestinationPath '${destDir}' -Force`,
    ], { shell: true });
    ps.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Expand-Archive exited with code ${code}`))));
    ps.on('error', reject);
  });
}

function findFileRecursive(dir: string, target: string): string | null {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const found = findFileRecursive(full, target);
      if (found) return found;
    } else if (entry.name === target) {
      return full;
    }
  }
  return null;
}

function buildGourceArgs(title: string): string[] {
  return [
    '--title', title,
    '--auto-skip-seconds', '1',
    '--viewport', '1280x720',
    '--font-size', '18',
    '--seconds-per-day', '0.10',
    '--stop-at-end',
    '-o', '-',
  ];
}

function buildFfmpegArgs(outputPath: string): string[] {
  return [
    '-y',
    '-r', '60',
    '-f', 'image2pipe',
    '-vcodec', 'ppm',
    '-i', '-',
    '-vcodec', 'libvpx',
    '-b:v', '10000K',
    outputPath,
  ];
}

function hideGourceWindow() {
  const script = [
    '-NoProfile',
    '-Command',
    [
      `Add-Type @'`,
      `using System;`,
      `using System.Runtime.InteropServices;`,
      `public class W {`,
      `  [DllImport("user32.dll")] public static extern bool ShowWindowAsync(IntPtr h, int n);`,
      `}`,
      `'@`,
      `$i = 0`,
      `while ($i -lt 30) {`,
      `  $p = Get-Process gource -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero } | Select-Object -First 1`,
      `  if ($p) {`,
      `    [W]::ShowWindowAsync($p.MainWindowHandle, 0) | Out-Null`,
      `    break`,
      `  }`,
      `  Start-Sleep -Milliseconds 500`,
      `  $i++`,
      `}`,
    ].join('\n'),
  ];
  spawn('powershell', script, { detached: true, stdio: 'ignore' }).unref();
}

async function run() {
  const outputPath = process.argv[2] ? resolve(process.cwd(), process.argv[2]) : join(process.cwd(), 'public', 'gource.webm');
  const title = process.argv[3] ?? 'gloved.dev';

  const gourcePath = await findGourceExe() ?? 'gource';

  const gource = spawn(gourcePath, buildGourceArgs(title));
  const ffmpeg = spawn('ffmpeg', buildFfmpegArgs(outputPath));

  gource.stdout.pipe(ffmpeg.stdin);

  gource.stderr.on('data', (d) => process.stderr.write(d));
  ffmpeg.stderr.on('data', (d) => process.stderr.write(d));

  gource.on('error', (err) => {
    console.error(`Failed to start gource at ${gourcePath}: ${err.message}`);
    process.exit(1);
  });

  ffmpeg.on('error', (err) => {
    console.error(`Failed to start ffmpeg: ${err.message}`);
    process.exit(1);
  });

  gource.on('close', (code) => {
    if (code !== 0) console.error(`gource exited with code ${code}`);
    ffmpeg.stdin.end();
  });

  ffmpeg.on('close', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg exited with code ${code}`);
      process.exit(code);
    }
    console.log(`gource.webm written to ${outputPath}`);
  });

  if (isWindows()) {
    hideGourceWindow();
  }
}

run();