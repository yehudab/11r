import postcss from 'rollup-plugin-postcss';
import replace from '@rollup/plugin-replace';
import svg from 'rollup-plugin-svg';
import path from 'path'
import { terser } from 'rollup-plugin-terser';

const dev = process.env.NODE_ENV !== 'production';

export default {
  input: 'src/scripts/main.js',
  output: {
    sourcemap: false,
    format: 'iife',
    name: 'main',
    file: 'dist/assets/main.bundle.js',
  },
  plugins: [
    replace({
      DEV_MODE: dev,
      preventAssignment: true,
    }),
    svg(),
    postcss({
      extract: path.resolve('dist/assets/main.bundle.css'),
      minimize: !dev,
    }),
    !dev && terser(),
  ],
  watch: {
    clearScreen: false,
  },
};
