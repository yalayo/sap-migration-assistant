#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';

console.log('🐳 Building for Docker deployment...');

// Step 1: Build the full application (client + server)
console.log('📦 Building application...');
execSync('npm run build', { stdio: 'inherit' });

console.log('✅ Docker build preparation complete!');
console.log('🐳 Docker image ready for build');
console.log('📋 Next steps:');
console.log('   1. docker build -t s4hana-migration-assistant .');
console.log('   2. docker run -p 8080:8080 s4hana-migration-assistant');
console.log('🚀 Or deploy directly with: wrangler deploy');