export declare class KustoMcpError extends Error {
    readonly code: string;
    readonly details?: unknown;
    constructor(message: string, code: string, details?: unknown);
}
export declare const ErrorCodes: {
    readonly CONNECTION_NOT_FOUND: "CONNECTION_NOT_FOUND";
    readonly CONNECTION_FAILED: "CONNECTION_FAILED";
    readonly QUERY_FAILED: "QUERY_FAILED";
    readonly SCRIPT_NOT_FOUND: "SCRIPT_NOT_FOUND";
    readonly INVALID_PARAMETER: "INVALID_PARAMETER";
    readonly CLI_NOT_FOUND: "CLI_NOT_FOUND";
    readonly TIMEOUT: "TIMEOUT";
    readonly AUTH_FAILED: "AUTH_FAILED";
    readonly UNKNOWN_ERROR: "UNKNOWN_ERROR";
};
export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];
export declare function formatError(error: unknown): string;
export declare function createConnectionError(connectionName: string): KustoMcpError;
export declare function createQueryError(message: string, details?: unknown): KustoMcpError;
export declare function createValidationError(message: string, parameter?: string): KustoMcpError;
export declare function isAuthError(errorMessage: string): boolean;
export declare function getAuthErrorHelp(errorMessage: string): string;
//# sourceMappingURL=error-handler.d.ts.map