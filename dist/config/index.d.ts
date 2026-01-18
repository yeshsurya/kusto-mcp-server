export * from './connections.js';
export interface KustoMcpConfig {
    kustoCliPath: string;
    defaultTimeout: number;
    maxRows: number;
}
export declare function loadConfig(): KustoMcpConfig;
export declare function getConfig(): KustoMcpConfig;
//# sourceMappingURL=index.d.ts.map