const { spawnSync } = require('child_process');
const path = require('path');

const root = path.resolve(__dirname, '..');
const scripts = [
  'audit-content.js',
  'audit-trivia.js',
  'audit-game-quality.js',
  'audit-jokes.js',
];

let failed = false;

scripts.forEach(scriptName => {
  const result = spawnSync(process.execPath, [path.join(root, 'scripts', scriptName)], {
    cwd: root,
    encoding: 'utf8',
  });

  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  if (result.status !== 0) failed = true;
});

if (failed) process.exit(1);
console.log('All Road Trip Adventures audits passed.');
