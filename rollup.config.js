import { nodeResolve } from '@rollup/plugin-node-resolve';
import babel from "@rollup/plugin-babel";

export default [
    {
        input: './js/index.umd.js',
        plugins: [
            nodeResolve(),
            babel({
                babelHelpers: 'bundled'
            }),
        ],
        output: {
            format: 'umd',
            name: 'T',
            file: './dist/3h-test.umd.js'
        }
    },
    {
        input: './js/index.js',
        output: {
            format: 'esm',
            file: './dist/3h-test.js'
        }
    }
];
