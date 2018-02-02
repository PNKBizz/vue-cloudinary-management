import vue from 'rollup-plugin-vue2';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import rollupJson from 'rollup-plugin-json';
import scss from 'rollup-plugin-scss';
import builtins from 'rollup-plugin-node-builtins';

export default {
  external: ['axios'],
  input: './src/main.client.js',
  output: {
    file: './dist/build.js',
    format: 'umd',
    name: 'vueCloudinaryUpload',
    globals: {
      'axios': 'axios'
    }
  },
  plugins: [
    vue(),
    scss({ output: 'styles.css' }),
    builtins(),
    resolve({ jsnext: true, main: true, browser: true, preferBuiltins: true }),
    commonjs({
      include: 'node_modules/**'
    }),
    rollupJson(),
    babel(),
    uglify()
  ]
};
