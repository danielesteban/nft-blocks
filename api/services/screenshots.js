const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');
const ipfs = require('./ipfs');

const html = fs.readFileSync(path.join(__dirname, 'screenshots.html'), 'utf-8');
const cache = new Map();
const queue = [];

let browser;
let isBusy;

const capture = (hash) => (
  ipfs.get(hash)
    .then((gltf) => (
      browser
        .newPage()
        .then((page) => (
          page
            // .on('console', (msg) => console.log('PAGE LOG:', msg.text()))
            .setViewport({ width: 512, height: 512 })
            .then(() => (
              page
                .setContent(html.replace(/__GLTF__/, JSON.stringify([...gltf])))
            ))
            .then(() => (
              page
                .waitForFunction('window.__READY__', { timeout: 10000 })
            ))
            .then(() => (
              page
                .screenshot({ type: 'png' })
            ))
            .finally(() => (
              page
                .close()
            ))
        ))
    ))
);

const processQueue = () => {
  const job = queue.shift();
  if (!job) return;
  isBusy = true;
  const { hash, promises } = job;
  capture(hash)
    .then((buffer) => {
      promises.forEach(({ resolve }) => resolve(buffer));
      cache.set(hash, buffer);
      while (cache.size > 100) {
        cache.delete(cache.keys().next().value);
      }
    })
    .catch((err) => promises.forEach(({ reject }) => reject(err)))
    .finally(() => setTimeout(() => {
      isBusy = false;
      processQueue();
    }, 1000));
};

puppeteer
  .launch({
    args: ['--no-sandbox'],
    // headless: false,
  })
  .then((instance) => {
    browser = instance;
    processQueue();
  });

module.exports = (hash) => new Promise((resolve, reject) => {
  const cached = cache.get(hash);
  if (cached) {
    resolve(cached);
    return;
  }
  const queued = queue.findIndex(({ hash: queued }) => (queued === hash));
  if (~queued) {
    queue[queued].promises.push({ resolve, reject });
    return;
  }
  queue.push({ hash, promises: [{ resolve, reject }] });
  if (browser && !isBusy) {
    processQueue();
  }
});
