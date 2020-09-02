# 3h-test

> A simple test lib.

## Links

- [API Reference](https://github.com/huang2002/3h-test/wiki)
- [Changelog](./CHANGELOG.md)
- [License (MIT)](./LICENSE)

## Example

```js
const T = require('3h-test');

T.test({ // default context options
    timeout: 1000,
}, { // test cases

    strictEqual(context) { // test case 0
        context.assertStrictEqual(1 + 2, 3);
    },

    promise(context) { // test case 1
        context.expectResolved(
            somePromise,
            'label',
            data => {
                // extra check on the data...
            }
        );
    },

});
```
