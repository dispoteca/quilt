import type { LoaderContext } from 'webpack';
export interface Options {
    name?: string;
    plain?: boolean;
}
export declare function pitch(this: LoaderContext<Options>, request: string): void;
declare const loader: {
    pitch: typeof pitch;
};
export default loader;
//# sourceMappingURL=loader.d.ts.map