import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';

export default {
  input: 'src/index.ts', // Giriş dosyanız
  output: [
    {
      file: 'dist/bundle.cjs.js', // CommonJS çıktısı
      format: 'cjs',
    },
    {
      file: 'dist/bundle.esm.js', // ESM çıktısı
      format: 'esm',
    },
  ],
  external: ['react'], // React ve ReactDOM'u harici olarak belirleyin
  plugins: [
    resolve(),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    babel({ babelHelpers: 'bundled' }),
    postcss({ // CSS dosyalarını işlemek için postcss eklentisi
      extract: true, // Tüm CSS'i tek bir dosyada toplamak istiyorsanız
      minimize: true, // Üretim için CSS'i minimize etmek istiyorsanız
    }),
  ],
};