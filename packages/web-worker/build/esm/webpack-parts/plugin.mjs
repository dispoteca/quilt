import VirtualModulesPlugin from 'webpack-virtual-modules';
import { PLUGIN } from '../common.mjs';

class WebWorkerPlugin {
  static isInstance(value) {
    return value != null && value[PLUGIN];
  }

  constructor(options = {}) {
    this.options = options;
    this.virtualModules = new VirtualModulesPlugin();
    this.workerId = 0;
    this[PLUGIN] = true;
  }

  apply(compiler) {
    this.virtualModules.apply(compiler);
  }

}

export { WebWorkerPlugin };