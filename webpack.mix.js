const mix = require('laravel-mix');

mix
  .js('src/app.js', 'dist')
  .copy('src/index.html', 'dist')
  .setPublicPath('dist');
