# assert-outdated

- Allows to set a maximal number of outdated dependencies.
- Enforces an up to date stack.
- Zero dependencies.

## Install

```
npm install --save-dev assert-outdated
```

### Usage

On commandline you can run the command like this:
```
node_modules/.bin/assert-outdated-npm-modules --max-warnings 10
```

Or put it into your `package.json`:
```
{
  "scripts": {
    "outdated-modules": "assert-outdated-npm-modules --max-warnings 10",
    "test": "npm run lint && npm run outdated-modules && npm run unit-test"
  }
}
```
