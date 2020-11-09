const T = require('..');

T.test({
    verbose: false,
}, {

    assert(context) {
        context.assert(true);
        context.assert(false, 'expected error');
    },

    assertEqual(context) {
        context.assertEqual(1 * 2, 2);
        context.assertEqual(NaN, NaN);
    },

    assertStrictEqual: {
        options: {
            verbose: true,
        },
        callback(context) {
            context.assertStrictEqual(1 + 2, 3);
            context.assertStrictEqual(.1 + .2, .3);
        },
    },

    assertShallowEqual(context) {
        context.assertShallowEqual(NaN, NaN);
        const a = { foo: 0, bar: '1' };
        const b = { foo: 0, bar: '1' };
        context.assertShallowEqual(a, b);
    },

    assertJSONEqual(context) {
        context.assertJSONEqual([[0, 1], [2, 3]], [[0, 1], [2, 3]]);
        context.assertJSONEqual({ a: 0, b: { c: 1 } }, { a: 0, b: { c: 1 } });
    },

    expectThrow(context) {
        class TestError extends Error { }
        const throwFn = error => { throw error; };
        context.expectThrow(throwFn, TestError, [new TestError()]);
        context.expectThrow(throwFn, 'string', ['test message']);
    },

    expectResolved(context) {
        const testData = 666;
        const promise = new Promise(resolve => {
            setTimeout(resolve, 500, testData);
        });
        context.expectResolved(
            promise,
            'promise to be resolved',
            data => {
                context.assertStrictEqual(data, testData);
            }
        );
    },

    expectRejected(context) {
        const testReason = 'test reason';
        const promise = new Promise((_, reject) => {
            setTimeout(reject, 500, testReason);
        });
        context.expectRejected(
            promise,
            'promise to be rejected',
            reason => {
                context.assertStrictEqual(reason, testReason);
            }
        );
    },

    timeout: {
        options: {
            timeout: 500,
        },
        callback(context) {
            const promise = new Promise(resolve => {
                setTimeout(resolve, 1000);
            });
            context.expectResolved(promise, 'timeout test');
        },
    },

}).then(() => {
    console.log('    (Expect: passed 5/9)');
});
