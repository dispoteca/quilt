import { createScriptUrl } from './utilities.mjs';
import { createWorkerMessenger } from '../messenger/worker.mjs';

function createPlainWorkerFactory(script) {
  const scriptUrl = createScriptUrl(script);

  function createWorker() {
    if (scriptUrl) {
      return createWorkerMessenger(scriptUrl);
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

export { createPlainWorkerFactory };
