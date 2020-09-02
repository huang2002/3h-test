import { TestContext, TestContextOptions } from './TestContext';

export type TestCaseCallback = (context: TestContext) => void;
/** dts2md break */
export interface TestCaseDescription {
    options: TestContextOptions;
    callback: TestCaseCallback;
}
/** dts2md break */
export interface TestCases {
    [name: string]: TestCaseCallback | TestCaseDescription;
}
/** dts2md break */
/**
 * Run given tests and print results to console
 * (note that the options in the test case description
 * will override the default options directly)
 */
export const test = async (
    defaultOptions: TestContextOptions | null,
    testCases: TestCases
) => {

    let totalCount = 0;
    let passedCount = 0;

    for (const [name, testCase] of Object.entries(testCases)) {

        console.log(`>>> Running test case "${name}":`);

        let context, callback;

        if (typeof testCase === 'function') {
            context = new TestContext(defaultOptions);
            callback = testCase;
        } else {
            context = new TestContext(testCase.options);
            callback = testCase.callback;
        }

        callback(context);

        if (context.pendingLabels.size) {
            await context.promise;
        } else {
            context.finish();
        }

        totalCount++;

        if (!context.errorCount) {
            console.log('passed.');
            passedCount++;
        }

        console.log();

    }

    console.log(`>>> Summary: passed ${passedCount}/${totalCount}.`);

};
