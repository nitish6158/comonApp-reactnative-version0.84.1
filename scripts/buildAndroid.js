const { spawnSync } = require('child_process');
const path = require('path');

const [, , envFile, gradleTask] = process.argv;

if (!envFile || !gradleTask) {
  console.error(
    'Usage: node scripts/buildAndroid.js <env-file> <gradle-task>',
  );
  process.exit(1);
}

const androidDir = path.join(process.cwd(), 'android');
const gradleCommand = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';

const result = spawnSync(gradleCommand, [gradleTask], {
  cwd: androidDir,
  env: {
    ...process.env,
    ENVFILE: `../${envFile}`,
  },
  shell: process.platform === 'win32',
  stdio: 'inherit',
});

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

