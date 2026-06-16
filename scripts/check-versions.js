const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const pkgs = execSync('dir /s /b package.json', { encoding: 'utf-8', cwd: __dirname }).split('\n').filter(Boolean);
pkgs.forEach(f => {
  f = f.trim();
  if (!f) return;
  try {
    const pkg = JSON.parse(fs.readFileSync(f, 'utf-8'));
    console.log(f.replace(__dirname, '.') + ' -> version: ' + JSON.stringify(pkg.version));
  } catch(e) {}
});
