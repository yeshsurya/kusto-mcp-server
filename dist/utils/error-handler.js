export class KustoMcpError extends Error {
    code;
    details;
    constructor(message, code, details) {
        super(message);
        this.name = 'KustoMcpError';
        this.code = code;
        this.details = details;
    }
}
export const ErrorCodes = {
    CONNECTION_NOT_FOUND: 'CONNECTION_NOT_FOUND',
    CONNECTION_FAILED: 'CONNECTION_FAILED',
    QUERY_FAILED: 'QUERY_FAILED',
    SCRIPT_NOT_FOUND: 'SCRIPT_NOT_FOUND',
    INVALID_PARAMETER: 'INVALID_PARAMETER',
    CLI_NOT_FOUND: 'CLI_NOT_FOUND',
    TIMEOUT: 'TIMEOUT',
    AUTH_FAILED: 'AUTH_FAILED',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};
export function formatError(error) {
    if (error instanceof KustoMcpError) {
        return `[${error.code}] ${error.message}`;
    }
    if (error instanceof Error) {
        return error.message;
    }
    return String(error);
}
export function createConnectionError(connectionName) {
    return new KustoMcpError(`Connection '${connectionName}' not found. Use kusto_connection_list to see available connections or kusto_connection_add to create one.`, ErrorCodes.CONNECTION_NOT_FOUND, { connectionName });
}
export function createQueryError(message, details) {
    return new KustoMcpError(message, ErrorCodes.QUERY_FAILED, details);
}
export function createValidationError(message, parameter) {
    return new KustoMcpError(message, ErrorCodes.INVALID_PARAMETER, { parameter });
}
export function isAuthError(errorMessage) {
    const authErrorPatterns = [
        /authentication failed/i,
        /unauthorized/i,
        /forbidden/i,
        /access denied/i,
        /token/i,
        /credential/i,
        /az login/i,
    ];
    return authErrorPatterns.some(pattern => pattern.test(errorMessage));
}
export function getAuthErrorHelp(errorMessage) {
    if (/az login/i.test(errorMessage)) {
        return 'Try running "az login" to authenticate with Azure CLI.';
    }
    if (/token expired/i.test(errorMessage)) {
        return 'Your authentication token has expired. Try running "az login" to refresh.';
    }
    return 'Authentication failed. Ensure you have the correct permissions and are properly authenticated.';
}
//# sourceMappingURL=error-handler.js.map