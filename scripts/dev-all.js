// scripts/dev-all.js
// Concurrently launches the NestJS backend and Next.js frontend for local full-stack development

const { spawn } = require('child_process');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

console.log('================================================================');
console.log(' Starting LaunchCommerce Full-Stack Development Environment');
console.log('================================================================\n');

function runProcess(name, command, args, cwd) {
  const isWindows = process.platform === 'win32';
  const proc = spawn(isWindows ? `${command}.cmd` : command, args, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, FORCE_COLOR: '1' },
    shell: isWindows,
  });

  proc.on('error', (err) => {
    console.error(`[${name}] Failed to start:`, err.message);
  });

  proc.on('exit', (code) => {
    console.log(`[${name}] Exited with code ${code}`);
  });

  return proc;
}

// 1. Start Lightweight Dev Redis (Port 6379)
console.log('[System] Launching Development Redis on localhost:6379 ...');
const redisProc = runProcess('Redis', 'node', ['scripts/dev-redis.js'], ROOT_DIR);

// 2. Start NestJS Backend (Port 4000)
console.log('[System] Launching NestJS Backend on http://localhost:4000 ...');
const backendProc = runProcess('Backend', 'npm', ['run', 'start:dev', '--workspace=@launchcommerce/backend'], ROOT_DIR);

// 3. Start Next.js Frontend (Port 3000)
console.log('[System] Launching Next.js Frontend on http://localhost:3000 ...\n');
const frontendProc = runProcess('Frontend', 'npm', ['run', 'dev', '--workspace=@launchcommerce/frontend'], ROOT_DIR);

function shutdown() {
  console.log('\n[System] Shutting down development servers...');
  redisProc.kill('SIGINT');
  backendProc.kill('SIGINT');
  frontendProc.kill('SIGINT');
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

