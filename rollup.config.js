import { nodeResolve } from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
export default {
    input: 'src/main.ts',
    output: {
        file: 'build/main.min.js',
    },
    plugins: [
        typescript({
            tsconfig: 'tsconfig.json',
        }),
        nodeResolve(),
        terser(),
    ],
}