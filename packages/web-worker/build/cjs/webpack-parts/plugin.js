'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var VirtualModulesPlugin = require('webpack-virtual-modules');
var common = require('../common.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var VirtualModulesPlugin__default = /*#__PURE__*/_interopDefaultLegacy(VirtualModulesPlugin);

class WebWorkerPlugin {
  static isInstance(value) {
    return value != null && value[common.PLUGIN];
  }

  constructor(options = {}) {
    this.options = options;
    this.virtualModules = new VirtualModulesPlugin__default['default']();
    this.workerId = 0;
    this[common.PLUGIN] = true;
  }

  apply(compiler) {
    this.virtualModules.apply(compiler);
  }

}

exports.WebWorkerPlugin = WebWorkerPlugin;
