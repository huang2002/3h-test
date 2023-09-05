import { TestContext, TestContextOptions } from './TestContext';

/**
 * Type of test case callbacks.
 */
export type TestCaseCallback = (context: TestContext) => void | PromiseLike<void>;
/** dts2md break */
/**
 * Type of test case descriptions.
 */
export interface TestCaseDescription {
    options: TestContextOptions;
    callback: TestCaseCallback;
}
/** dts2md break */
/**
 * Type of test cases.
 */
export interface TestCases {
    [name: string]: TestCaseCallback | TestCaseDescription;
}
/** dts2md break */
/**
 * Type of test options.
 */
export type TestOptions = Partial<{
    /**
     * Default options for test contexts.
     */
    defaultOptions: TestContextOptions | null;
    /**
      * Whether to print detailed info.
      * @default true
      */
    verbose: boolean;
    /**
     * Only run tests whose names are listed here.
     * Omit this option to run all tests.
     */
    include: string[];
    /**
     * Skip tests whose names are listed here.
     */
    exclude: string[];
}>;
/** dts2md break */
/**
 * Run the given tests and print results to console.
 * (Note that the options in the test case description
 * will override the default options.)
 */
export const test = async (
    options: TestOptions | null,
    testCases: TestCases
) => {

    const verbose = !options || (options.verbose !== false);
    const defaultOptions = options && options.defaultOptions;
    const include = options && options.include;
    const exclude = options && options.exclude;
    let totalCount = 0;
    let passedCount = 0;

    for (const [name, testCase] of Object.entries(testCases)) {

        if (include && !include.includes(name)) {
            continue;
        } else if (exclude && exclude.includes(name)) {
            continue;
        }

        if (verbose) {
            console.log(`>>> Running test "${name}":`);
        }

        let context, callback;

        if (typeof testCase === 'function') {
            context = new TestContext(defaultOptions);
            callback = testCase;
        } else {
            context = new TestContext(testCase.options);
            callback = testCase.callback;
        }

        await callback(context);

        if (context.pendingLabels.size) {
            await context.promise;
        } else {
            context.finish();
        }

        totalCount++;

        if (verbose && !context.errorCount) {
            console.log('passed.');
            passedCount++;
            console.log();
        }

    }

    if (verbose) {
        console.log(`>>> Summary: passed ${passedCount}/${totalCount}.`);
    }

};
