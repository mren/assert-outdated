#!/usr/bin/env node

const childProcess = require('child_process');

const exec = (command, options) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve, reject) => childProcess.exec(command, options, (err, stdout, stderr) =>
    // eslint-disable-next-line implicit-arrow-linebreak
    ((err && stdout.length === 0) ? reject(err) : resolve({ stdout, stderr }))));
module.exports.exec = exec;

const objectToList = (obj) => Object.keys(obj).map((name) => ({ name, ...obj[name] }));
module.exports.objectToList = objectToList;

const errorHandler = (err) => {
  console.log(err); // eslint-disable-line no-console
  process.exit(1);
};

const filterDependencies = (outdatedDependencies, ignorePreReleases) => {
  if (ignorePreReleases) {
    return Promise.resolve(outdatedDependencies.filter((dependency) => (
      dependency.current.indexOf('-') !== -1 || dependency.latest.indexOf('-') === -1
    )));
  }
  return Promise.resolve(outdatedDependencies);
};

const assertDependencies = (outdatedDependencies, maxWarnings) => {
  if (outdatedDependencies.length > maxWarnings) {
    const msg = 'Too many outdated dependencies';
    const details = `${outdatedDependencies.length} instead of ${maxWarnings})`;
    return Promise.reject(Object.assign(new Error(`${msg} (${details}.`), { outdatedDependencies }));
  }
  return Promise.resolve();
};

const getOutdatedDependencies = () => exec('npm outdated --json --save false')
  .then((result) => result.stdout || '{}')
  .then(JSON.parse)
  .then(objectToList);

const parseArgs = (argv) => argv.reduce((previousValue, currentValue, currentIndex) => {
  if (currentValue === '--max-warnings') {
    const maxWarnings = argv[currentIndex + 1] && Number(argv[currentIndex + 1]);
    if (Number.isFinite(maxWarnings)) {
      return { ...previousValue, maxWarnings };
    }
  } else if (currentValue === '--ignore-pre-releases') {
    return { ...previousValue, ignorePreReleases: true };
  }
  return previousValue;
}, {});

const outdated = (argv) => {
  const args = parseArgs(argv);
  if (!Number.isFinite(args.maxWarnings)) {
    console.log('Usage: --max-warnings <Number> [--ignore-pre-releases]'); // eslint-disable-line no-console
    return Promise.resolve();
  }
  return getOutdatedDependencies()
    .then((dependencies) => filterDependencies(dependencies, args.ignorePreReleases))
    .then((dependencies) => assertDependencies(dependencies, args.maxWarnings));
};
module.exports.outdated = outdated;

if (!module.parent) {
  outdated(process.argv)
    .catch(errorHandler);
}
