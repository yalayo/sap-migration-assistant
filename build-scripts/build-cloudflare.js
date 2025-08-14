#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

console.log('🔨 Building for Cloudflare Pages...');

// Step 1: Build the client (React app)
console.log('📦 Building client...');
execSync('vite build', { stdio: 'inherit' });

// Step 2: Build the server for Cloudflare
console.log('🛠️  Building server...');
execSync('esbuild server/index.ts server/app.ts server/auth.ts server/routes.ts server/storage.ts server/db.ts server/cloudflare-adapter.ts --platform=neutral --packages=external --bundle=false --format=esm --outdir=dist --target=es2022', { stdio: 'inherit' });

// Step 3: Create the Cloudflare Pages Functions
console.log('⚡ Setting up Cloudflare Functions...');

// Ensure functions directory exists
import { mkdirSync } from 'fs';
if (!existsSync('functions')) {
  mkdirSync('functions', { recursive: true });
}
if (!existsSync('functions/api')) {
  mkdirSync('functions/api', { recursive: true });
}

// Create the catch-all function for API routes
const functionsContent = `// This file handles all API routes for Cloudflare Pages Functions
export { onRequest } from '../../dist/cloudflare-adapter.js';`;

writeFileSync('functions/api/[[path]].js', functionsContent);

// Copy _redirects file to dist/public
import { copyFileSync } from 'fs';
if (existsSync('_redirects')) {
  copyFileSync('_redirects', 'dist/public/_redirects');
}

console.log('✅ Cloudflare build complete!');
console.log('📁 Static files: dist/public');
console.log('⚡ Functions: functions/api/[[path]].js');
console.log('🚀 Ready for deployment!');