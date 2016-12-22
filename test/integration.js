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
});
