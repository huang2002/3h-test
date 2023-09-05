// @ts-check

const T = /** @type {import('..')} */(
    /** @type unknown */(require('../dist/3h-test.umd.js'))
);

T.test({
    verbose: false,
}, {

    assert(context) {
        context.assert(true);
        context.assert(false, 'expected error');
    },

}).then(() => {

    return T.test({
        include: [
            'skip_1',
            'assertEqual',
            'assertStrictEqual',
            'assertShallowEqual',
            'assertJSONEqual',
            'assertDeepEqual',
            'expectThrow',
            'expectResolved',
            'expectRejected',
            'timeout',
            'setTimeout',
        ],
        exclude: [
            'skip_1',
        ],
    }, {

        skip_0(context) {
            context.throw('this should be skipped');
        },

        skip_1(context) {
            context.throw('this should be skipped');
        },

        assertEqual(context) {
            context.assertEqual(1 * 2, 2);
            context.assertEqual(NaN, NaN); // expect: failure
        },

        assertStrictEqual(context) {
            context.assertStrictEqual(1 + 2, 3);
            context.assertStrictEqual(.1 + .2, .3); // expect: failure
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

        assertDeepEqual(context) {
            context.assertDeepEqual([[0, 1], [2, 3]], [[0, 1], [2, 3]]);
            context.assertDeepEqual({ a: 0, b: { c: 1 } }, { a: 0, b: { c: 1 } });
            context.assertDeepEqual({ a: 0, b: { c: 1 } }, { b: { c: 1 }, a: 0 });
            const o = {};
            o.o = o;
            context.assertDeepEqual(o, { o });
        },

        expectThrow(context) {
            class TestError extends Error { }
            const throwFn = error => { throw error; };
            context.expectThrow(TestError, throwFn, [new TestError()]);
            context.expectThrow(
                'string',
                throwFn,
                ['test message'],
                (error) => {
                    context.assertStrictEqual(error, 'test message');
                },
            );
        },

        async expectResolved(context) {
            const testData = await Promise.resolve(666);
            const promise = new Promise(resolve => {
                setTimeout(resolve, 500, testData);
            });
            context.expectResolved(
                promise,
                'promise to be resolved',
                data => {
                    context.assertStrictEqual(data, 666);
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
                context.expectResolved(promise, 'timeout test'); // expect: failure
            },
        },

        setTimeout(context) {
            let flag = false;
            setTimeout(() => {
                flag = true;
            }, 100);
            context.setTimeout(() => {
                context.assertStrictEqual(flag, false);
            }, 50, 'setTimeout_50');
            context.setTimeout(() => {
                context.assertStrictEqual(flag, true);
                cancelExtraCheck();
            }, 150, 'setTimeout_150');
            const cancelExtraCheck = context.setTimeout(() => {
                context.throw('this check should have been canceled');
            }, 200, 'setTimeout_200');
        },

    });

}).then(() => {
    console.log('    (Expect: passed 7/10)');
});
