#!/usr/bin/env node

const childProcess = require('child_process');

function exec(command, options) {
  return new Promise((resolve, reject) => {
    childProcess.exec(command, options, (err, stdout, stderr) => {
      if (err) {
        return reject(err);
      }
      return resolve({ stdout, stderr });
    });
  });
}
module.exports.exec = exec;

function npmOutdatedToList(outdatedObject) {
  return Object.keys(outdatedObject)
    .map(name => Object.assign({ name }, outdatedObject[name]));
}
module.exports.npmOutdatedToList = npmOutdatedToList;

function jsonParse(jsonString) {
  try {
    return Promise.resolve(JSON.parse(jsonString));
  } catch (err) {
    return Promise.reject(new Error(jsonString));
  }
}
module.exports.jsonParse = jsonParse;

function errorHandler(err) {
  console.log(err); // eslint-disable-line no-console
  process.exit(1);
}

function assertDependencies(outdatedDependencies, maxWarnings) {
  if (outdatedDependencies.length > maxWarnings) {
    const msg = 'Too many outdated dependencies';
    const details = `${outdatedDependencies.length} instead of ${maxWarnings})`;
    return Promise.reject(new Error(`${msg} (${details}.`));
  }
  return Promise.resolve();
}

function getOutdatedDependencies() {
  return exec('npm outdated --json')
    .then(result => result.stdout)
    .then(result => (result === '' ? '{}' : result))
    .then(jsonParse)
    .then(npmOutdatedToList);
}

function parseArgs(argv) {
  return argv.reduce((previousValue, currentValue, currentIndex) => {
    if (currentValue === '--max-warnings') {
      const maxWarnings = argv[currentIndex + 1] && Number(argv[currentIndex + 1]);
      if (Number.isFinite(maxWarnings)) {
        return Object.assign({}, previousValue, { maxWarnings });
      }
    }
    return previousValue;
  }, {});
}

if (!module.parent) {
  const args = parseArgs(process.argv);
  if (!Number.isFinite(args.maxWarnings)) {
    console.log('Usage: --max-warnings <Number>'); // eslint-disable-line no-console
    process.exit(0);
  }

  getOutdatedDependencies()
    .then(dependencies => assertDependencies(dependencies, args.maxWarnings))
    .catch(errorHandler);
}
