import { nodeResolve } from '@rollup/plugin-node-resolve';
import glsl from 'rollup-plugin-glsl';
import typescript from '@rollup/plugin-typescript';
import { terser } from 'rollup-plugin-terser';
export default {
    input: 'src/main.ts',
    output: {
        file: 'build/main.min.js',
    },
    plugins: [
        glsl({
            include: 'src/**/*.glsl',
            exclude: 'src/**/*.ts',
            sourceMap: false,
        }),
        typescript({
            tsconfig: 'tsconfig.json',
        }),
        nodeResolve(),
        terser(),
    ],
}