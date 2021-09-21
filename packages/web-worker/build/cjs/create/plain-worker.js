'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var utilities = require('./utilities.js');
var worker = require('../messenger/worker.js');

function createPlainWorkerFactory(script) {
  const scriptUrl = utilities.createScriptUrl(script);

  function createWorker() {
    if (scriptUrl) {
      return worker.createWorkerMessenger(scriptUrl);
    } // We can’t create a worker without a browser environment,
    // so we return a proxy that just does nothing.


    return new Proxy({}, {
      get(_target, _property) {
        return () => {
          throw new Error('You can’t call a method on a worker on the server.');
        };
      }

    });
  }

  Reflect.defineProperty(createWorker, 'url', {
    value: scriptUrl
  });
  return createWorker;
}

exports.createPlainWorkerFactory = createPlainWorkerFactory;
