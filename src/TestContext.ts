import { Utils } from './Utils';

export class AssertionError extends Error { }
/** dts2md break */
export type TestContextOptions = Partial<{
    timeout: number;
}>;
/** dts2md break */
/**
 * (Usually created internally and passed to test case callbacks)
 */
export class TestContext implements Required<TestContextOptions> {
    /** dts2md break */
    /**
     * Assert there are not more pending labels in the given context
     * (usually used internally)
     */
    static checkPendingLabels(context: TestContext) {
        const { pendingLabels } = context;
        if (pendingLabels.size) {
            const labels = Array.from(pendingLabels.values())
                .map(label => `"${label}"`)
                .join(', ');
            context.throw(`pending label(s) detected: ${labels}`);
        }
    }
    /** dts2md break */
    /**
     * @param options Default context options
     */
    constructor(options?: TestContextOptions | null) {
        if (options) {
            Object.assign(this, options);
        }
    }
    /** dts2md break */
    /**
     * Maximum timeout in milliseconds
     * (After this limit, the context will check whether
     * there are remaining pending labels left by asynchronous
     * operations and report existing labels as an error)
     * @default 5000
     */
    timeout = 5000;
    /** dts2md break */
    /**
     * Whether the test case is finished
     * (assigned internally)
     */
    finished = false;
    /** dts2md break */
    /**
     * Count of raised errors
     */
    errorCount = 0;
    /** dts2md break */
    /**
     * (this should only be modified by
     * `this.addPendingLabel` & `this.deletePendingLabel`)
     */
    pendingLabels = new Set<string>();

    private _resolvePromise!: () => void;
    private _pendingCheckTimer: any = null;
    /** dts2md break */
    /**
     * A promise resolved when the test case is finished
     */
    readonly promise = new Promise<void>(resolve => {
        this._resolvePromise = resolve;
    });
    /** dts2md break */
    /**
     * Finish the test case
     * (usually invoked internally and automatically)
     */
    finish = () => {
        if (this.finished) {
            return;
        }
        TestContext.checkPendingLabels(this);
        this.finished = true;
        this._resolvePromise();
        if (this._pendingCheckTimer !== null) {
            clearTimeout(this._pendingCheckTimer);
            this._pendingCheckTimer = null;
        }
    };
    /** dts2md break */
    /**
     * Assert the test case is not finished
     * (usually used internally)
     */
    checkFinished() {
        if (this.finished) {
            this.throw('test context finished', false);
        }
    }
    /** dts2md break */
    /**
     * Raise an error and invoke `this.checkFinished`
     * unless the `checkFinished` parameter is `false`
     */
    throw(message: string, checkFinished = true) {
        if (checkFinished) {
            this.checkFinished();
        }
        this.errorCount++;
        console.error(new AssertionError(message));
        console.log();
    }
    /** dts2md break */
    /**
     * Assert the given condition is `true`
     */
    assert(condition: boolean, message = 'assertion failed') {
        this.checkFinished();
        if (!condition) {
            this.throw(message);
        }
    }
    /** dts2md break */
    /**
     * Assert `value == expected`
     */
    assertEqual(value: unknown, expected: unknown) {
        this.checkFinished();
        if (value != expected) {
            this.throw(`${value} != ${expected}`);
        }
    }
    /** dts2md break */
    /**
     * Assert `value === expected`
     */
    assertStrictEqual(value: unknown, expected: unknown) {
        this.checkFinished();
        if (value !== expected) {
            this.throw(`${value} !== ${expected}`);
        }
    }
    /** dts2md break */
    /**
     * Assert `value` and `expected` are shallowly equal
     * (using `Utils.compare` internally)
     */
    assertShallowEqual(
        value: unknown,
        expected: unknown,
        message = 'assertion failed',
    ) {
        this.checkFinished();
        if (!Utils.compare(value, expected)) {
            this.throw(message);
            console.log('Expected:', expected);
            console.log('Actual:', value);
        }
    }
    /** dts2md break */
    /**
     * Assert `value` and `expected` are deeply equal
     * (using `Utils.compareDeeply` internally)
     */
    assertDeepEqual(
        value: unknown,
        expected: unknown,
        message = 'assertion failed',
    ) {
        this.checkFinished();
        if (!Utils.compareDeeply(value, expected)) {
            this.throw(message);
            console.log('Expected:', expected);
            console.log('Actual:', value);
        }
    }
    /** dts2md break */
    /**
     * Assert `value` and `expected` are equal in JSON format
     * (using `JSON.stringify` & `Utils.compare` internally)
     */
    assertJSONEqual(
        value: unknown,
        expected: unknown,
        message = 'assertion failed',
    ) {
        this.checkFinished();
        const actualJSON = JSON.stringify(value);
        const expectedJSON = JSON.stringify(expected);
        if (!Utils.compare(actualJSON, expectedJSON)) {
            this.throw(message);
            console.log('Expected:', expectedJSON);
            console.log('Actual:', actualJSON);
        }
    }
    /** dts2md break */
    /**
     * Assert the given callback to throw a specific type of error
     * (when `errorType` is a string, assert the type of the raised error
     * equals `errorType`; otherwise, assert the raised error is
     * an instance of `errorType`)
     */
    expectThrow<T extends any[], U>(
        errorType: Function | string,
        callback: (this: U, ...args: T) => any,
        args?: T,
        thisArg?: U,
    ) {

        this.checkFinished();

        try {
            callback.apply(thisArg!, args!);
            this.throw('no error caught');
        } catch (error) {

            if (typeof errorType === 'function') {
                if (error instanceof errorType) {
                    return;
                }
            } else {
                if (typeof error === errorType) {
                    return;
                }
            }

            this.throw(
                `unexpected error type ${Object.prototype.toString.call(error)}`
            );

        }

    }
    /** dts2md break */
    /**
     * Add a pending label
     * (usually invoked internally)
     */
    addPendingLabel(label: string) {
        this.checkFinished();
        const { pendingLabels } = this;
        if (pendingLabels.has(label)) {
            this.throw(`duplicate label "${label}"`);
        }
        pendingLabels.add(label);
    }
    /** dts2md break */
    /**
     * Remove a pending label
     * (usually invoked internally)
     */
    deletePendingLabel(label: string) {
        const { pendingLabels } = this;
        if (pendingLabels.has(label)) {
            pendingLabels.delete(label);
            if (!pendingLabels.size) {
                this.finish();
            }
        } else {
            this.throw(`unknown label "${label}"`);
        }
    }
    /** dts2md break */
    /**
     * Set up pending check
     */
    protected _setPendingCheck() {
        if (this._pendingCheckTimer !== null) {
            clearTimeout(this._pendingCheckTimer);
        }
        this._pendingCheckTimer = setTimeout(
            this.finish,
            this.timeout,
        );
    }
    /** dts2md break */
    /**
     * Expect the given promise to be resolved
     * @param promise Target promise
     * @param label A pending label for debug use
     * @param callback A callback invoked with resolved
     * data when the promise is resolved, which can be
     * used to do some extra check on the data
     */
    expectResolved<T>(
        promise: Promise<T>,
        label: string,
        callback?: (data: T) => void,
    ) {
        this.checkFinished();
        this.addPendingLabel(label);
        this._setPendingCheck();
        promise.then(
            data => {
                if (callback) {
                    callback(data);
                }
                this.deletePendingLabel(label);
            },
            reason => {
                this.throw(`[${label}] promise rejected: ${reason}`);
                this.deletePendingLabel(label);
            }
        );
    }
    /** dts2md break */
    /**
     * Expect the given promise to be rejected
     * @param promise Target promise
     * @param label A pending label for debug use
     * @param callback A callback invoked with rejected
     * reason when the promise is rejected, which can be
     * used to do some extra check on the reason
     */
    expectRejected(
        promise: Promise<any>,
        label: string,
        callback?: (reason: unknown) => void,
    ) {
        this.checkFinished();
        this.addPendingLabel(label);
        this._setPendingCheck();
        promise.then(
            data => {
                this.throw(`[${label}] promise resolved: ${data}`);
                this.deletePendingLabel(label);
            },
            reason => {
                if (callback) {
                    callback(reason);
                }
                this.deletePendingLabel(label);
            }
        );
    }

}
