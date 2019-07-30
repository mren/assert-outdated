const assert = require('assert');

const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');

describe('assert-outdated integration', () => {
  it('should return success for empty outdated dependencies', () => {
    const childProcess = {
      exec: sinon.stub().yields(null, JSON.stringify({})),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0']);
  });

  it('should call correct npm command', () => {
    const childProcess = {
      exec: sinon.stub().yields(null, JSON.stringify({})),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0'])
      .then(() => {
        sinon.assert.calledWith(childProcess.exec, 'npm outdated --json --save false');
      });
  });

  it('should fail with outdated modules', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      releaseToPreReleaseModule: {
        current: '1.0.0',
        latest: '1.1.0-beta',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
      preReleaseToPreReleaseModule: {
        current: '1.0.0-beta.1',
        latest: '1.1.0-beta.2',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
    };
    const childProcess = {
      exec: sinon.stub().yields(null, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (3 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }, {
          current: '1.0.0',
          latest: '1.1.0-beta',
          location: 'node_modules/module',
          name: 'releaseToPreReleaseModule',
          wanted: '1.0.0',
        }, {
          current: '1.0.0-beta.1',
          latest: '1.1.0-beta.2',
          location: 'node_modules/module',
          name: 'preReleaseToPreReleaseModule',
          wanted: '1.0.0',
        }]);
      });
  });

  it('should fail with outdated modules on npm@4', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      releaseToPreReleaseModule: {
        current: '1.0.0',
        latest: '1.1.0-beta',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
      preReleaseToPreReleaseModule: {
        current: '1.0.0-beta.1',
        latest: '1.1.0-beta.2',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
    };
    const error = Object.assign(
      new Error('Command failed: npm outdated --json --save false'),
      { killed: false, code: 1, signal: 0, cmd: 'npm outdated --json --save false' }
    );
    const childProcess = {
      exec: sinon.stub().yields(error, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (3 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }, {
          current: '1.0.0',
          latest: '1.1.0-beta',
          location: 'node_modules/module',
          name: 'releaseToPreReleaseModule',
          wanted: '1.0.0',
        }, {
          current: '1.0.0-beta.1',
          latest: '1.1.0-beta.2',
          location: 'node_modules/module',
          name: 'preReleaseToPreReleaseModule',
          wanted: '1.0.0',
        }]);
      });
  });

  it('should ignore "git", "linked" and "remote" dependencies', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      gitModule: {
        current: '1.0.0',
        latest: 'git',
        location: 'node_modules/module',
        wanted: 'git',
      },
      linkedModule: {
        current: '1.0.0',
        latest: 'linked',
        location: 'node_modules/module',
        wanted: 'linked',
      },
      remoteModule: {
        current: '1.0.0',
        latest: 'remote',
        location: 'node_modules/module',
        wanted: 'remote',
      },
    };
    const childProcess = {
      exec: sinon.stub().yields(null, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (1 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }]);
      });
  });

  it('should ignore "git", "linked" and "remote" dependencies npm@4', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      gitModule: {
        current: '1.0.0',
        latest: 'git',
        location: 'node_modules/module',
        wanted: 'git',
      },
      linkedModule: {
        current: '1.0.0',
        latest: 'linked',
        location: 'node_modules/module',
        wanted: 'linked',
      },
      remoteModule: {
        current: '1.0.0',
        latest: 'remote',
        location: 'node_modules/module',
        wanted: 'remote',
      },
    };
    const error = Object.assign(
      new Error('Command failed: npm outdated --json --save false'),
      { killed: false, code: 1, signal: 0, cmd: 'npm outdated --json --save false' }
    );
    const childProcess = {
      exec: sinon.stub().yields(error, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (1 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }]);
      });
  });

  it('should ignore pre-releases', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      releaseToPreReleaseModule: {
        current: '1.0.0',
        latest: '1.1.0-beta',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
      preReleaseToPreReleaseModule: {
        current: '1.0.0-beta.1',
        latest: '1.1.0-beta.2',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
    };
    const childProcess = {
      exec: sinon.stub().yields(null, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0', '--ignore-pre-releases'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (2 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }, {
          current: '1.0.0-beta.1',
          latest: '1.1.0-beta.2',
          location: 'node_modules/module',
          name: 'preReleaseToPreReleaseModule',
          wanted: '1.0.0',
        }]);
      });
  });

  it('should ignore pre-releases npm@4', () => {
    const result = {
      module: {
        current: '1.0.0',
        latest: '2.0.0',
        location: 'node_modules/module',
        wanted: '2.0.0',
      },
      preReleaseModule: {
        current: '1.0.0',
        latest: '1.1.0-beta',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
      preReleaseToPreReleaseModule: {
        current: '1.0.0-beta.1',
        latest: '1.1.0-beta.2',
        location: 'node_modules/module',
        wanted: '1.0.0',
      },
    };
    const error = Object.assign(
      new Error('Command failed: npm outdated --json --save false'),
      { killed: false, code: 1, signal: 0, cmd: 'npm outdated --json --save false' }
    );
    const childProcess = {
      exec: sinon.stub().yields(error, JSON.stringify(result)),
    };
    const outdated = proxyquire('../outdated', { child_process: childProcess });
    return outdated.outdated(['--max-warnings', '0', '--ignore-pre-releases'])
      .then(() => Promise.reject(new Error()))
      .catch((err) => {
        assert.strictEqual(err.message, 'Too many outdated dependencies (2 instead of 0).');
        assert.deepEqual(err.outdatedDependencies, [{
          current: '1.0.0',
          latest: '2.0.0',
          location: 'node_modules/module',
          name: 'module',
          wanted: '2.0.0',
        }, {
          current: '1.0.0-beta.1',
          latest: '1.1.0-beta.2',
          location: 'node_modules/module',
          name: 'preReleaseToPreReleaseModule',
          wanted: '1.0.0',
        }]);
      });
  });
});
