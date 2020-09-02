import { Utils } from './Utils';

export class AssertionError extends Error { }

export interface TestContextOptions {
    timeout: number;
    verbose: boolean;
}

export class TestContext implements TestContextOptions {

    static checkPendingLabels(context: TestContext) {
        const { pendingLabels } = context;
        if (pendingLabels.size) {
            const labels = [...pendingLabels.values()].join(', ');
            context.throw(`pending label(s) detected: ${labels}`);
        }
    }

    constructor(options?: Partial<TestContextOptions> | null) {
        if (options) {
            Object.assign(this, options);
        }
    }

    timeout = 5000;
    verbose = true;

    finished = false;
    errorCount = 0;
    pendingLabels = new Set<string>();

    readonly promise = new Promise<void>(resolve => {
        this._resolvePromise = resolve;
    });

    private _resolvePromise!: () => void;
    private _pendingCheckTimer: any = null;

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

    checkFinished() {
        if (this.finished) {
            this.throw('test context finished', false);
        }
    }

    throw(message: string, checkFinished = true) {
        if (checkFinished) {
            this.checkFinished();
        }
        this.errorCount++;
        console.error(
            this.verbose
                ? new AssertionError(message)
                : `AssertionError: ${message}`
        );
    }

    assert(condition: boolean, message = 'assertion failed') {
        this.checkFinished();
        if (!condition) {
            this.throw(message);
        }
    }

    assertEqual(value: unknown, expected: unknown) {
        this.checkFinished();
        if (value != expected) {
            this.throw(`${value} != ${expected}`);
        }
    }

    assertStrictEqual(value: unknown, expected: unknown) {
        this.checkFinished();
        if (value !== expected) {
            this.throw(`${value} !== ${expected}`);
        }
    }

    assertShallowEqual(
        value: unknown,
        expected: unknown,
        message = 'assertion failed',
    ) {
        this.checkFinished();
        if (!Utils.compare(value, expected)) {
            this.throw(message);
        }
    }

    expectThrow<T extends any[], U>(
        callback: (this: U, ...args: T) => unknown,
        errorType: Function | string,
        args?: T,
        thisArg?: U,
    ) {

        this.checkFinished();

        try {
            callback.apply(thisArg!, args!);
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

            this.throw(`incorrect error type`);

        }

        this.throw(`no error caught`);

    }

    addPendingLabel(label: string) {
        this.checkFinished();
        const { pendingLabels } = this;
        if (pendingLabels.has(label)) {
            this.throw('duplicate label');
        }
        pendingLabels.add(label);
    }

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

    protected _setPendingCheck() {
        if (this._pendingCheckTimer !== null) {
            clearTimeout(this._pendingCheckTimer);
        }
        this._pendingCheckTimer = setTimeout(
            this.finish,
            this.timeout,
        );
    }

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
