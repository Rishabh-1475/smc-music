const fs = require('fs');
const path = require('path');

const versionData = {
  version: Date.now().toString(),
  build: 'rythemx-live',
  timestamp: new Date().toISOString()
};

const outDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const versionPath = path.join(outDir, 'version.json');
fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
console.log('[Version] Generated public/version.json:', versionData.version);
