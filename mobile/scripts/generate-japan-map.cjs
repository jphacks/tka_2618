const fs = require('node:fs');
const path = require('node:path');

const sourcePath = path.join(__dirname, '..', 'assets', 'maps', 'japan-prefectures.svg');
const destinationPath = path.join(__dirname, '..', 'src', 'data', 'japanMapShapes.ts');
const source = fs.readFileSync(sourcePath, 'utf8');
const pathPattern = /<path[^>]*data-code="(\d+)"[^>]*data-name="([^"]+)"[^>]*d="([^"]+)"/g;
const shapes = [];

for (const match of source.matchAll(pathPattern)) {
  shapes.push({ code: `JP-${match[1].padStart(2, '0')}`, name: match[2], path: match[3] });
}

if (shapes.length !== 47) {
  throw new Error(`Expected 47 prefectures, found ${shapes.length}`);
}

const output = `// Generated from assets/maps/japan-prefectures.svg. Do not edit manually.\n` +
  `// Source: https://github.com/lalamalink/japan-map-svg (CC0 1.0)\n` +
  `import type { MapShape } from './mapShapes';\n\n` +
  `export const japanMapShapes: MapShape[] = ${JSON.stringify(shapes, null, 2)};\n`;

fs.writeFileSync(destinationPath, output);
