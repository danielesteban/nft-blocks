import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import json from '@rollup/plugin-json';
import livereload from 'rollup-plugin-livereload';
import resolve from '@rollup/plugin-node-resolve';
import svelte from 'rollup-plugin-svelte';
import { terser } from 'rollup-plugin-terser';

const production = !process.env.ROLLUP_WATCH;

const serve = () => {
  let server;
  const onExit = () => {
    if (server) {
      server.kill(0);
    }
  };
  return {
    writeBundle() {
      if (server) {
        return;
      }
      server = spawn('npm', ['run', 'client:serve'], {
        stdio: ['ignore', 'inherit', 'inherit'],
        shell: true,
      });
      process.on('SIGTERM', onExit);
      process.on('exit', onExit);
    },
  };
};

const workersPath = path.join(__dirname, 'src', 'workers');
const workers = fs.readdirSync(workersPath)
  .filter((name) => ~name.indexOf('.js'))
  .map((name) => name.substr(0, name.length - 3));

export default [
  {
    input: path.join(__dirname, 'src', 'main.js'),
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: path.join(__dirname, 'dist', 'app.js'),
    },
    plugins: [
      svelte({
        dev: !production,
        css: (css) => css.write(path.join(__dirname, 'dist', 'app.css')),
      }),
      resolve({
        browser: true,
        dedupe: ['svelte'],
      }),
      json(),
      ...(production ? [terser()] : [serve(), livereload(path.join(__dirname, 'dist'))]),
    ],
  },
  ...workers.map((name) => ({
    input: path.join(workersPath, `${name}.js`),
    output: {
      sourcemap: true,
      format: 'iife',
      name: 'app',
      file: path.join(__dirname, 'dist', `${name}.worker.js`),
    },
    plugins: [
      ...(production ? [terser()] : []),
    ],
  })),
];
