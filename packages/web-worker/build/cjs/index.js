'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var rpc = require('@shopify/rpc');
var worker = require('./create/worker.js');
var plainWorker = require('./create/plain-worker.js');
var worker$1 = require('./messenger/worker.js');
var iframe = require('./messenger/iframe.js');



Object.defineProperty(exports, 'release', {
  enumerable: true,
  get: function () {
    return rpc.release;
  }
});
Object.defineProperty(exports, 'retain', {
  enumerable: true,
  get: function () {
    return rpc.retain;
  }
});
exports.createWorkerFactory = worker.createWorkerFactory;
exports.expose = worker.expose;
exports.terminate = worker.terminate;
exports.createPlainWorkerFactory = plainWorker.createPlainWorkerFactory;
exports.createWorkerMessenger = worker$1.createWorkerMessenger;
exports.createIframeWorkerMessenger = iframe.createIframeWorkerMessenger;
