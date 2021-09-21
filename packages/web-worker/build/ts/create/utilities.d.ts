export declare type FileOrModuleResolver<T> = () => Promise<T> | string;
export declare function createScriptUrl(script: FileOrModuleResolver<any>): URL | undefined;
//# sourceMappingURL=utilities.d.ts.map