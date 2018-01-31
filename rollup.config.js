import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';
import rollupJson from 'rollup-plugin-json';

export default {
  input: './src/main.client.js',
  output: {
    file: './dist/build.js',
    format: 'umd',
    name: 'vueCloudinaryUpload'
  },
  plugins: [
    resolve({ jsnext: true, main: true, browser: true }),
    commonjs({
      include: 'node_modules/**'
    }),
    rollupJson(),
    vue({ compileTemplate: true }),
    babel(),
    uglify()
  ]
};
