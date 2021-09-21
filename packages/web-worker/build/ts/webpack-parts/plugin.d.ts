import VirtualModulesPlugin from 'webpack-virtual-modules';
import type { WebpackPluginInstance, Compiler } from 'webpack';
import { PLUGIN } from '../common';
interface Options {
    globalObject?: string;
    plugins?: WebpackPluginInstance[];
}
export declare class WebWorkerPlugin implements WebpackPluginInstance {
    readonly options: Options;
    static isInstance(value: unknown): value is WebWorkerPlugin;
    readonly virtualModules: VirtualModulesPlugin;
    workerId: number;
    private readonly [PLUGIN];
    constructor(options?: Options);
    apply(compiler: Compiler): void;
}
export {};
//# sourceMappingURL=plugin.d.ts.map