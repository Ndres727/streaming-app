const os = require('os');
const fs = require('fs');
const path = require('path');

console.log('=== EAS Build Pre-Install Debug ===');
console.log('Platform:', os.platform());
console.log('Release:', os.release());
console.log('CWD:', process.cwd());
console.log('Node:', process.version);
console.log('EAS_BUILD:', process.env.EAS_BUILD);
console.log('EAS_BUILD_PLATFORM:', process.env.EAS_BUILD_PLATFORM);
console.log('EAS_BUILD_PROFILE:', process.env.EAS_BUILD_PROFILE);
console.log('PATH:', process.env.PATH);

// Check which package manager
try {
  const yarnVersion = require('child_process').execSync('yarn --version', { encoding: 'utf8' }).trim();
  console.log('Yarn version:', yarnVersion);
} catch (e) {
  console.log('Yarn: NOT AVAILABLE');
}

try {
  const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
  console.log('npm version:', npmVersion);
} catch (e) {
  console.log('npm: NOT AVAILABLE');
}

// Directory structure
console.log('\n=== Directory listing ===');
function listDir(dir, depth = 0) {
  if (depth > 3) return;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
      const prefix = '  '.repeat(depth);
      if (entry.isDirectory()) {
        console.log(`${prefix}${entry.name}/`);
        listDir(path.join(dir, entry.name), depth + 1);
      } else {
        console.log(`${prefix}${entry.name}`);
      }
    }
  } catch (e) {
    console.log(`  ${'  '.repeat(depth)}(cannot read: ${e.message})`);
  }
}
listDir(process.cwd());

// Check package.json files
console.log('\n=== package.json files ===');
const pkgJsons = ['package.json', '../../package.json', '../package.json'];
for (const p of pkgJsons) {
  const fullPath = path.resolve(process.cwd(), p);
  try {
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    console.log(`\n${p}:`);
    console.log(`  name: ${content.name}`);
    console.log(`  workspaces: ${content.workspaces ? JSON.stringify(content.workspaces) : 'none'}`);
    console.log(`  packageManager: ${content.packageManager || 'not set'}`);
  } catch (e) {
    console.log(`\n${p}: NOT FOUND or invalid`);
  }
}

// Check yarn.lock
console.log('\n=== Lock files ===');
for (const lock of ['yarn.lock', '../../yarn.lock', '../yarn.lock', 'package-lock.json', '../../package-lock.json']) {
  const fullPath = path.resolve(process.cwd(), lock);
  console.log(`${lock}: ${fs.existsSync(fullPath) ? 'EXISTS' : 'NOT FOUND'}`);
}

// Check workspace packages
console.log('\n=== Workspace packages ===');
for (const pkg of ['../../packages/shared-types', '../../packages/api-client']) {
  const pkgPath = path.resolve(process.cwd(), pkg);
  const pkgJsonPath = path.join(pkgPath, 'package.json');
  const distPath = path.join(pkgPath, 'dist');
  console.log(`\n${pkg}:`);
  console.log(`  package.json: ${fs.existsSync(pkgJsonPath) ? 'EXISTS' : 'NOT FOUND'}`);
  console.log(`  dist/: ${fs.existsSync(distPath) ? 'EXISTS' : 'NOT FOUND'}`);
  if (fs.existsSync(distPath)) {
    try {
      const files = fs.readdirSync(distPath);
      console.log(`  dist files: ${files.join(', ')}`);
    } catch (e) {
      console.log(`  dist files: ERROR: ${e.message}`);
    }
  }
}

console.log('\n=== End of Debug ===');
