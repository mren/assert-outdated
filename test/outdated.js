const assert = require('assert');

const outdated = require('../outdated');

describe('assert-outdated', () => {
  it('should run exec', () => outdated.exec('true'));

  it('should run exec with failing status code', () => outdated.exec('false')
     .catch(() => 'failed')
     .then(result => assert.strictEqual(result, 'failed'))
  );

  it('should transform npm output', () => {
    const result = outdated.objectToList({ name: { foo: true } });
    assert.deepStrictEqual(result, [{ name: 'name', foo: true }]);
  });
});
