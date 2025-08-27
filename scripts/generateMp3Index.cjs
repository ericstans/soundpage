// This script should be run on the server to generate a list of mp3 files in /public/mp3s
// For local dev, you can run this with Node.js
const fs = require('fs');
const path = require('path');

const mp3Dir = path.join(__dirname, '../public/mp3s');
const outFile = path.join(mp3Dir, 'index.json');

const files = fs.readdirSync(mp3Dir).filter(f => f.endsWith('.mp3'));
fs.writeFileSync(outFile, JSON.stringify(files, null, 2));
console.log('Wrote', outFile);
