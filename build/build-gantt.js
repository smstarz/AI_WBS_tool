const path = require('path');
const esbuild = require('esbuild');

const projectRoot = path.resolve(__dirname, '..');

const aliasLangPlugin = {
  name: 'alias-lang',
  setup(build) {
    build.onResolve({ filter: /^\.\/lang$/ }, args => {
      if (args.importer.includes(path.join('jsgantt-improved', 'dist', 'src'))) {
        return { path: path.resolve(__dirname, 'lang-en.js') };
      }
    });
  }
};

esbuild.build({
  entryPoints: [path.resolve(__dirname, 'jsgantt-entry.js')],
  bundle: true,
  platform: 'browser',
  format: 'iife',
  target: ['es2018'],
  outfile: path.resolve(projectRoot, 'js/jsgantt.bundle.js'),
  sourcemap: false,
  plugins: [aliasLangPlugin],
  define: {
    global: 'window'
  }
}).then(() => {
  console.log('Custom JSGantt bundle generated at js/jsgantt.bundle.js');
}).catch(err => {
  console.error(err);
  process.exit(1);
});
