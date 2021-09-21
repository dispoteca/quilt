'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var path = require('path');
var plugin = require('./plugin.js');

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () {
            return e[k];
          }
        });
      }
    });
  }
  n['default'] = e;
  return Object.freeze(n);
}

var path__namespace = /*#__PURE__*/_interopNamespace(path);

const NAME = 'WebWorker';
function pitch(request) {
  const callback = this.async();
  const {
    context,
    resourcePath,
    _compiler: compiler,
    _compilation: compilation
  } = this;

  if (compiler == null || compilation == null) {
    return callback(new Error('compiler or compilation is undefined'));
  }

  if (compiler.options.output.globalObject !== 'self') {
    return callback(new Error('webpackConfig.output.globalObject is not set to "self", which will cause chunk loading in the worker to fail. Please change the value to "self" for any builds targeting the browser, or set the {noop: true} option on the @shopify/web-worker babel plugin.'));
  }

  const {
    EntryPlugin,
    webworker,
    web
  } = compiler.webpack;
  const plugin$1 = compiler.options.plugins.find(plugin.WebWorkerPlugin.isInstance);

  if (plugin$1 == null) {
    return callback(new Error('You must also include the WebWorkerPlugin from `@shopify/web-worker` when using the Babel plugin.'));
  }

  const options = this.getOptions();
  const {
    name = String(plugin$1.workerId++),
    plain = false
  } = options;
  const virtualModule = path__namespace.join(path__namespace.dirname(resourcePath), `${path__namespace.basename(resourcePath, path__namespace.extname(resourcePath))}.worker.js`);

  if (!plain) {
    plugin$1.virtualModules.writeModule(virtualModule, `
        import * as api from ${JSON.stringify(request)};
        import {expose} from '@shopify/web-worker/worker';
        expose(api);
      `);
  }

  const workerOptions = {
    filename: addWorkerSubExtension(compiler.options.output.filename),
    chunkFilename: addWorkerSubExtension(compiler.options.output.chunkFilename),
    globalObject: plugin$1 && plugin$1.options.globalObject || 'self'
  };
  const workerCompiler = compilation.createChildCompiler(NAME, workerOptions, []);
  workerCompiler.context = compiler.context;
  new webworker.WebWorkerTemplatePlugin().apply(workerCompiler);
  new web.FetchCompileWasmPlugin({
    mangleImports: compiler.options.optimization.mangleWasmImports
  }).apply(workerCompiler);
  new EntryPlugin(context, plain ? request : virtualModule, name).apply(workerCompiler);

  for (const aPlugin of plugin$1.options.plugins || []) {
    aPlugin.apply(workerCompiler);
  }

  workerCompiler.runAsChild((error, entries, compilation) => {
    let finalError;

    if (!error && compilation !== null && compilation !== void 0 && compilation.errors && compilation.errors.length) {
      finalError = compilation.errors[0];
    }

    const entry = entries && entries[0] && Array.from(entries[0].files)[0];

    if (!finalError && !entry) {
      finalError = new Error(`WorkerPlugin: no entry for ${request}`);
    }

    if (finalError) {
      return callback(finalError);
    }

    return callback(null, `export default __webpack_public_path__ + ${JSON.stringify(entry)};`);
  });
}

function addWorkerSubExtension(file) {
  return file.includes('[name]') ? file.replace(/\.([a-z]+)$/i, '.worker.$1') : file.replace(/\.([a-z]+)$/i, '.[name].worker.$1');
}

const loader = {
  pitch
};

exports.default = loader;
exports.pitch = pitch;
