/* global __dirname */
// Version and whole-file hashes prevent silent patch drift after dependency updates.
const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const root = path.resolve(__dirname, '..');
const patches = require('../patches/security.json');
const lock = require('../package-lock.json');
const checkOnly = process.argv.includes('--check');
const hash = text => createHash('sha256').update(text).digest('hex');
const writes = [];
let checked = 0;

for (const patch of patches) {
  const locations = Object.keys(lock.packages).filter(location =>
    location === `node_modules/${patch.package}` || location.endsWith(`/node_modules/${patch.package}`));
  if (!locations.length) throw new Error(`Missing dependency: ${patch.package}`);
  for (const location of locations) {
    const directory = path.join(root, location);
    const installed = JSON.parse(fs.readFileSync(path.join(directory, 'package.json'), 'utf8'));
    if (installed.version !== patch.version) {
      throw new Error(`Review security patch for ${patch.package}@${installed.version}`);
    }
    const file = path.join(directory, patch.file);
    const text = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    checked++;
    if (hash(text) === patch.after) continue;
    if (checkOnly || hash(text) !== patch.before) {
      throw new Error(`Security patch missing or source changed: ${file}`);
    }
    let result = text;
    for (const { old: before, new: after } of patch.replacements) {
      if (result.split(before).length !== 2) throw new Error(`Ambiguous patch: ${file}`);
      result = result.replace(before, after);
    }
    if (hash(result) !== patch.after) throw new Error(`Invalid patch result: ${file}`);
    writes.push([file, result]);
  }
}
// Validate everything before writing anything. Fail installation on unexpected sources.
for (const [file, result] of writes) fs.writeFileSync(file, result);
console.log(`Security patches: ${checked} files verified, ${writes.length} updated.`);
