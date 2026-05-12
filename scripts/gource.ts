import { spawn } from 'child_process';
import { join, resolve } from 'path';

const outputPath = process.argv[2]
  ? resolve(process.cwd(), process.argv[2])
  : join(process.cwd(), 'public', 'gource.webm');

const gourceArgs = [
  '--title', 'gloved.dev',
  '--auto-skip-seconds', '1',
  '--viewport', '1280x720',
  '--font-size', '18',
  '--seconds-per-day', '0.10',
  '--stop-at-end',
  '-o', '-',
];

const ffmpegArgs = [
  '-y',
  '-r', '60',
  '-f', 'image2pipe',
  '-vcodec', 'ppm',
  '-i', '-',
  '-vcodec', 'libvpx',
  '-b:v', '10000K',
  outputPath,
];

const gource = spawn('gource', gourceArgs, { shell: true });
const ffmpeg = spawn('ffmpeg', ffmpegArgs, { shell: true });

gource.stdout.pipe(ffmpeg.stdin);

gource.stderr.on('data', (d) => process.stderr.write(d));
ffmpeg.stderr.on('data', (d) => process.stderr.write(d));

gource.on('error', (err) => {
  console.error(`Failed to start gource: ${err.message}`);
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

if (process.platform === 'win32') {
  const hideScript = [
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
  spawn('powershell', hideScript, { detached: true, stdio: 'ignore' }).unref();
}
