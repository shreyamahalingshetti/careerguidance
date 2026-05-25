#!/usr/bin/env node
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function run(cmd, args, opts = {}) {
  let res;
  if (opts && opts.shell) {
    // join into single command string so shell handles quoting correctly on Windows
    const cmdPath = cmd.indexOf(' ') >= 0 ? `"${cmd}"` : cmd;
    const cmdStr = `${cmdPath} ${Array.isArray(args) ? args.join(' ') : ''}`;
    res = spawnSync(cmdStr, { stdio: 'inherit', shell: true, ...opts });
  } else {
    res = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  }
  if (res.error || res.status !== 0) {
    console.error(`Command failed: ${cmd} ${Array.isArray(args) ? args.join(' ') : ''}`);
    if (res.error) console.error('Error:', res.error);
    if (typeof res.status !== 'undefined') console.error('Exit status:', res.status);
    if (res.stdout) console.error('Stdout:', res.stdout.toString());
    if (res.stderr) console.error('Stderr:', res.stderr.toString());
    if (opts && opts.allowFailure) {
      console.warn('Continuing despite failure because allowFailure=true (common on OneDrive/antivirus file locks).');
      return res;
    }
    process.exit(res.status || 1);
  }
  return res;
}

const root = path.resolve(__dirname, '..');
process.chdir(root);

console.log('-> prepare-dev: running in', root);

// 0) If Next.js build artifacts are corrupted (common with OneDrive/AV locks), clear .next so dev can start.
try {
  const nextDir = path.join(root, '.next');
  const webpackCacheDir = path.join(nextDir, 'cache', 'webpack');

  // Best-effort cleanup: stale webpack cache on Windows can trigger ChunkLoadError and ENOENT rename failures.
  try {
    if (fs.existsSync(webpackCacheDir)) {
      fs.rmSync(webpackCacheDir, { recursive: true, force: true });
      console.log('Removed stale .next/cache/webpack cache.');
    }
  } catch (cacheErr) {
    console.warn('Warning: could not clean .next/cache/webpack:', cacheErr instanceof Error ? cacheErr.message : String(cacheErr));
  }

  if (fs.existsSync(nextDir)) {
    const manifestCandidates = [
      path.join(nextDir, 'build-manifest.json'),
      path.join(nextDir, 'prerender-manifest.json'),
      path.join(nextDir, 'server', 'pages-manifest.json'),
      path.join(nextDir, 'server', 'app-paths-manifest.json'),
    ];

    let corrupted = false;
    for (const p of manifestCandidates) {
      if (!fs.existsSync(p)) continue;
      try {
        const raw = fs.readFileSync(p, 'utf8');
        JSON.parse(raw);
      } catch {
        corrupted = true;
        break;
      }
    }

    if (corrupted) {
      console.warn('Detected corrupted .next manifest JSON. Removing .next to recover...');
      fs.rmSync(nextDir, { recursive: true, force: true });
      console.log('Removed .next successfully.');
    }
  }
} catch (e) {
  console.warn('Warning: could not validate/clean .next folder:', e instanceof Error ? e.message : String(e));
}

// 1) Ensure dependencies are installed
if (!fs.existsSync(path.join(root, 'node_modules'))) {
  console.log('node_modules not found — running `npm install` (this may take a few minutes)...');
  run('npm', ['install']);
} else {
  console.log('node_modules exists — skipping `npm install`.');
}

// 2) Ensure .env exists (create from .env.example if present)
const envPath = path.join(root, '.env');
const envExample = path.join(root, '.env.example');
if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExample)) {
    console.log('.env not found — copying from .env.example');
    fs.copyFileSync(envExample, envPath);
    console.log('.env created from .env.example (please review values).');
  } else {
    console.log('.env.example not found — writing minimal .env for local SQLite dev.');
    fs.writeFileSync(envPath, 'DATABASE_URL="file:./dev.db"\nNEXTAUTH_SECRET="dev-secret-change-me"\nNEXTAUTH_URL="http://localhost:3000"\n', 'utf8');
    console.log('.env created with SQLite defaults.');
  }
} else {
  console.log('.env already exists.');
}

// 3) Generate Prisma client (skip if already present to avoid file lock races)
const prismaClientDir = path.join(root, 'node_modules', '@prisma', 'client');
if (fs.existsSync(prismaClientDir)) {
  console.log('Prisma client already exists — skipping `npx prisma generate`.');
} else {
  // prefer local binary to avoid PATH issues
  const prismaBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
  console.log('Generating Prisma client using local binary:', prismaBin);
  run(prismaBin, ['generate'], { shell: process.platform === 'win32', allowFailure: true });
}

// 4) Apply schema to DB for local dev
// prefer local binary to avoid PATH issues
const prismaBin = path.join(root, 'node_modules', '.bin', process.platform === 'win32' ? 'prisma.cmd' : 'prisma');
console.log('Applying Prisma schema to the database using local binary:', prismaBin);
run(prismaBin, ['db', 'push', '--skip-generate'], { shell: process.platform === 'win32', allowFailure: true });

console.log('Prepare step finished.');
process.exit(0);
