import vue from 'rollup-plugin-vue';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import uglify from 'rollup-plugin-uglify';

export default {
  input: './src/main.client.js',
  output: {
    file: './dist/build.js',
    format: 'umd',
    name: 'vueCloudinaryUpload'
  },
  plugins: [
    resolve({ browser: true }),
    vue({ compileTemplate: true }),
    babel(),
    uglify()
  ]
};
