const assert = require('assert');

const outdated = require('../outdated');

describe('assert-outdated', () => {
  it('should run exec', () => outdated.exec('true'));

  it('should run exec with failing status code', () => outdated.exec('false')
     .catch(() => 'failed')
     .then(result => assert.strictEqual(result, 'failed'))
  );

  it('should transform npm output', () => {
    const result = outdated.npmOutdatedToList({ name: { foo: true } });
    assert.deepStrictEqual(result, [{ name: 'name', foo: true }]);
  });

  it('should validate json', () => {
    outdated.jsonParse(JSON.stringify({ foo: true }))
      .then(result => assert.deepStrictEqual(result, { foo: true }));
  });

  it('should catch json validation error', () => {
    outdated.jsonParse('unexpected')
      .catch(err => assert.strictEqual(err.message, 'unexpected'));
  });
});
