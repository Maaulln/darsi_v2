#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const process = require('process');

const cwd = process.cwd();
const isWindows = process.platform === 'win32';
let shuttingDown = false;
const children = [];

function prefixStream(prefix, stream) {
  stream.on('data', (chunk) => {
    const message = chunk.toString();
    message.split(/\r?\n/).forEach((line) => {
      if (line.length === 0) return;
      process.stdout.write(`[${prefix}] ${line}\n`);
    });
  });
}

function spawnService(name, command, args, options = {}) {
  const child = spawn(command, args, { shell: isWindows, ...options, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(child);

  prefixStream(name, child.stdout);
  prefixStream(name, child.stderr);

  child.on('exit', (code, signal) => {
    if (shuttingDown) return;
    
    // Ignore shutdown for background tasks that are allowed to exit or fail silently
    if (name === 'SEEDER' || name === 'OLLAMA') {
      console.log(`[${name}] process finished or exited.`);
      return;
    }

    if (code !== 0) {
      console.error(`[${name}] exited with code ${code}${signal ? ` signal ${signal}` : ''}`);
      shutdown(1);
      return;
    }
    console.log(`[${name}] exited cleanly.`);
    shutdown(code || 0);
  });

  child.on('error', (error) => {
    console.error(`[${name}] failed to start: ${error.message}`);
    shutdown(1);
  });

  return child;
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      try {
        child.kill('SIGINT');
      } catch (error) {
        // ignore
      }
    }
  }

  setTimeout(() => process.exit(code), 500);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
process.on('uncaughtException', (error) => {
  console.error(`[STARTER] Uncaught exception: ${error.message}`);
  shutdown(1);
});

console.log('🚀 Starting DARSI services...');
console.log('  • DOCKER   : docker-compose up');
console.log('  • BACKEND  : python -m uvicorn main:app --reload --port 8001 --host 0.0.0.0');
console.log('  • FRONTEND : npm run dev');
console.log('  • OLLAMA   : ollama serve (AI Models)');
console.log('  • SEEDER   : python seed_dummy.py\n');

// 1. Ollama (Background AI Server)
try {
  const ollama = spawn('ollama', ['serve'], { shell: isWindows, stdio: ['ignore', 'pipe', 'pipe'] });
  children.push(ollama);
  prefixStream('OLLAMA', ollama.stdout);
  prefixStream('OLLAMA', ollama.stderr);
  ollama.on('error', () => {
    console.log('\x1b[33m[OLLAMA] Ollama tidak ditemukan. Jika butuh fitur AI, download di: https://ollama.com/download\x1b[0m');
  });
} catch (e) {
  console.log('\x1b[33m[OLLAMA] Ollama tidak terinstall.\x1b[0m');
}

// 2. Docker (SurrealDB)
spawnService('DOCKER', 'docker-compose', ['up', 'surrealdb'], { cwd });

// 3. Backend (wait 5s for DB)
setTimeout(() => {
  const backendCommand = isWindows ? 'py' : 'python';
  const backendArgs = isWindows
    ? ['-3', '-m', 'uvicorn', 'main:app', '--reload', '--port', '8001', '--host', '0.0.0.0']
    : ['-m', 'uvicorn', 'main:app', '--reload', '--port', '8001', '--host', '0.0.0.0'];

  spawnService('BACKEND', backendCommand, backendArgs, { cwd: path.join(cwd, 'backend') });
}, 5000);

// 4. Seeder (wait 7s for DB to be fully ready)
setTimeout(() => {
  const backendCommand = isWindows ? 'py' : 'python';
  spawnService('SEEDER', backendCommand, ['seed_dummy.py'], { cwd: path.join(cwd, 'backend') });
}, 7000);

// 5. Frontend (wait 9s)
setTimeout(() => {
  const npmCommand = isWindows ? 'npm.cmd' : 'npm';
  spawnService('FRONTEND', npmCommand, ['run', 'dev'], { cwd: path.join(cwd, 'frontend') });
}, 9000);
