const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', '..');
const addon = path.join(root, 'tf2-trading-hub');
const required = [
  path.join(root, 'repository.yaml'),
  path.join(addon, 'config.yaml'),
  path.join(addon, 'build.yaml'),
  path.join(addon, 'Dockerfile'),
  path.join(addon, 'run.sh'),
  path.join(addon, 'dist', 'server.js'),
  path.join(addon, 'dist', 'index.js'),
  path.join(addon, 'public', 'index.html'),
  path.join(addon, 'public', 'app.js'),
  path.join(addon, 'public', 'styles.css')
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    console.error(`Missing required file: ${path.relative(root, file)}`);
    process.exit(1);
  }
}

for (const file of [path.join(root, 'repository.yaml'), path.join(addon, 'config.yaml'), path.join(addon, 'build.yaml')]) {
  const text = fs.readFileSync(file, 'utf8');
  const lines = text.split(/\r?\n/).filter(Boolean).length;
  if (lines < 3) {
    console.error(`YAML file appears to be compressed into too few lines: ${path.relative(root, file)}`);
    process.exit(1);
  }
}

const config = fs.readFileSync(path.join(addon, 'config.yaml'), 'utf8');
if (!/slug:\s*tf2_trading_hub/.test(config)) {
  console.error('config.yaml slug must stay tf2_trading_hub');
  process.exit(1);
}
if (!/ingress:\s*true/.test(config) || !/ingress_port:\s*8099/.test(config)) {
  console.error('config.yaml must enable ingress on port 8099');
  process.exit(1);
}

console.log('Structure check passed.');
