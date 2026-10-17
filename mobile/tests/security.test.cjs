const assert = require('node:assert/strict');
const { test } = require('node:test');
const braces = require('braces');
const forge = require('node-forge');
const nested = (depth, left = '{', right = '}') => left.repeat(depth) + 'a' + right.repeat(depth);
const depthError = { name: 'SyntaxError', message: 'braces nesting exceeds security limit (100)' };

test('braces preserves ordinary patterns, ranges, escaped and quoted braces', () => {
  assert.deepEqual(braces.expand('src/{app,lib}/{1..3}.ts'), [
    'src/app/1.ts', 'src/app/2.ts', 'src/app/3.ts', 'src/lib/1.ts', 'src/lib/2.ts', 'src/lib/3.ts',
  ]);
  assert.equal(braces.compile('src/{app,lib}.ts'), 'src/(app|lib).ts');
  assert.equal(braces.stringify(braces.parse('a/{b,c}/d')), 'a/{b,c}/d');
  assert.doesNotThrow(() => braces.compile(nested(98)));
  assert.doesNotThrow(() => braces.compile('\\{'.repeat(120) + 'a'));
  assert.doesNotThrow(() => braces.compile('"' + nested(120) + '"'));
});

test('braces rejects deep brace, parenthesis and unclosed patterns before stack exhaustion', () => {
  for (const pattern of [nested(4000), nested(4000, '(', ')'), '{'.repeat(4000), '({'.repeat(2000) + 'a' + '})'.repeat(2000)]) {
    for (const fn of [braces, braces.parse, braces.compile, braces.expand, braces.stringify]) {
      assert.throws(() => fn(pattern), depthError);
    }
  }
});

test('braces walkers reject deep AST inputs that bypass parse', () => {
  for (const fn of [braces.compile, braces.expand, braces.stringify]) {
    let ast = { type: 'text', value: 'a' };
    for (let i = 0; i < 4000; i++) ast = { type: 'root', nodes: [ast] };
    assert.throws(() => fn(ast), depthError);
  }
});

// Sign deliberately malformed DigestInfo with a test key: verifies the vulnerable
// parser path through the real public RSA verification API, without mocking ASN.1.
const keys = forge.pki.rsa.generateKeyPair({ bits: 1024, e: 0x10001 });
const digest = forge.md.sha256.create().update('security regression').digest().getBytes();
const asn1 = forge.asn1;
const element = (type, constructed, value) => asn1.create(asn1.Class.UNIVERSAL, type, constructed, value);
function signature(parameters, extras = []) {
  const algorithm = [element(asn1.Type.OID, false, asn1.oidToDer(forge.pki.oids.sha256).getBytes())];
  if (parameters) algorithm.push(element(asn1.Type.NULL, false, ''));
  algorithm.push(...extras);
  const info = element(asn1.Type.SEQUENCE, true, [
    element(asn1.Type.SEQUENCE, true, algorithm),
    element(asn1.Type.OCTETSTRING, false, digest),
  ]);
  return keys.privateKey.sign(asn1.toDer(info).getBytes(), 'NONE');
}

test('RSA verifies valid SHA256 with optional NULL and rejects a changed digest', () => {
  for (const parameters of [true, false]) {
    const signed = signature(parameters);
    assert.equal(keys.publicKey.verify(digest, signed), true);
    assert.equal(keys.publicKey.verify('x'.repeat(32), signed), false);
  }
});

test('RSA rejects extra nested DigestAlgorithm elements with or without NULL', () => {
  for (const parameters of [true, false]) {
    for (const extra of [
      element(asn1.Type.OCTETSTRING, false, 'garbage'),
      element(asn1.Type.SEQUENCE, true, [element(asn1.Type.OCTETSTRING, false, 'garbage')]),
    ]) {
      assert.throws(() => keys.publicKey.verify(digest, signature(parameters, [extra])), /DigestInfo/);
    }
  }
});

test('patch installer detects skipped scripts and source drift, and is idempotent', () => {
  const fs = require('node:fs');
  const os = require('node:os');
  const path = require('node:path');
  const { spawnSync } = require('node:child_process');
  const project = path.dirname(require.resolve('../package.json'));
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'jphack-security-'));
  try {
    for (const directory of ['scripts', 'patches']) {
      fs.mkdirSync(path.join(fixture, directory));
    }
    fs.copyFileSync(path.join(project, 'scripts/security-patches.cjs'), path.join(fixture, 'scripts/security-patches.cjs'));
    fs.copyFileSync(path.join(project, 'patches/security.json'), path.join(fixture, 'patches/security.json'));
    const patches = require('../patches/security.json');
    const packages = {};
    for (const patch of patches) {
      const location = `node_modules/${patch.package}`;
      packages[location] = { version: patch.version };
      const file = path.join(fixture, location, patch.file);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(path.join(fixture, location, 'package.json'), JSON.stringify({ version: patch.version }));
      let original = fs.readFileSync(path.join(project, location, patch.file), 'utf8');
      for (const change of [...patch.replacements].reverse()) original = original.replace(change.new, change.old);
      fs.writeFileSync(file, original);
    }
    fs.writeFileSync(path.join(fixture, 'package-lock.json'), JSON.stringify({ packages }));
    const run = (...args) => spawnSync(process.execPath, ['scripts/security-patches.cjs', ...args], { cwd: fixture, encoding: 'utf8' });
    assert.notEqual(run('--check').status, 0);
    assert.equal(run().status, 0);
    assert.equal(run('--check').status, 0);
    assert.match(run().stdout, /0 updated/);
    fs.appendFileSync(path.join(fixture, 'node_modules/node-forge/lib/rsa.js'), '\n// unexpected drift\n');
    assert.notEqual(run('--check').status, 0);
    assert.notEqual(run().status, 0);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
});
