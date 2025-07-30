const fs = require('fs');
const path = require('path');

// Read package.json to get version
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;
const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');

// Generate new cache name with version and timestamp
const newCacheName = `beyblade-tracker-v${version}-${timestamp}`;

// Read current service worker
const swPath = path.join('public', 'sw.js');
let swContent = fs.readFileSync(swPath, 'utf8');

// Update cache name
swContent = swContent.replace(
    /const CACHE_NAME = '[^']+';/,
    `const CACHE_NAME = '${newCacheName}';`
);

// Write updated service worker
fs.writeFileSync(swPath, swContent);

console.log(`✅ Service Worker cache updated to: ${newCacheName}`);
console.log('🔄 PWA clients will now receive updates on next visit');
