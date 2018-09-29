import babel from "rollup-plugin-babel";
import resolve from "rollup-plugin-node-resolve";
import { terser } from "rollup-plugin-terser";
import commonjs from "rollup-plugin-commonjs";
import postcss from "rollup-plugin-postcss";

export default {
    input: "src/index.js",
    output: {
        file: "dist/bundle.min.js",
        format: "cjs",
        sourcemap: true,
    },
    plugins: [
        postcss({
            extensions: [ ".css" ],
        }),
        resolve({
            jsnext: true,
            main: true,
            browser: true,
        }),
        babel({
            externalHelpers: true,
            exclude: "node_modules/**",
        }),
        commonjs(),
        // terser(),
    ],
};
