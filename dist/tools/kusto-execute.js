import { executeCommands } from '../executor/kusto-executor.js';
import { getConnection, getDefaultConnection } from '../config/connections.js';
import { formatAsTable } from '../executor/output-parser.js';
import { createConnectionError, createQueryError, createValidationError } from '../utils/error-handler.js';
export const kustoExecuteTool = {
    name: 'kusto_execute',
    description: 'Execute advanced Kusto commands with full CLI options. Use this for control commands, multiple statements, or when you need fine-grained control.',
    inputSchema: {
        type: 'object',
        properties: {
            commands: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of KQL commands/queries to execute in sequence',
            },
            connectionName: {
                type: 'string',
                description: 'Name of a saved connection to use',
            },
            connectionString: {
                type: 'string',
                description: 'Direct connection string (overrides connectionName). Format: Data Source=https://cluster.kusto.windows.net;Initial Catalog=database',
            },
            database: {
                type: 'string',
                description: 'Database name (overrides connection default)',
            },
            authMethod: {
                type: 'string',
                enum: ['azcli', 'managedIdentity', 'default'],
                description: 'Authentication method when using connectionString directly',
            },
            managedIdentityId: {
                type: 'string',
                description: 'Client ID for managed identity authentication',
            },
            timeout: {
                type: 'number',
                description: 'Execution timeout in milliseconds',
            },
            quitOnError: {
                type: 'boolean',
                description: 'Stop execution on first error',
            },
            format: {
                type: 'string',
                enum: ['json', 'table', 'raw'],
                description: 'Output format',
            },
        },
        required: ['commands'],
    },
};
export async function handleKustoExecute(params) {
    const { commands, connectionName, connectionString, database, authMethod = 'azcli', managedIdentityId, timeout, quitOnError, format = 'json', } = params;
    if (!commands || commands.length === 0) {
        throw createValidationError('Commands array cannot be empty', 'commands');
    }
    // Determine connection configuration
    let connection;
    let directConnectionString = connectionString;
    if (!directConnectionString) {
        if (connectionName) {
            connection = getConnection(connectionName);
            if (!connection) {
                throw createConnectionError(connectionName);
            }
        }
        else {
            connection = getDefaultConnection();
            if (!connection) {
                throw createValidationError('No connection specified. Provide connectionName, connectionString, or configure a default connection.', 'connectionName');
            }
        }
    }
    // Build execution options
    const options = {
        commands,
        connection: connection ? {
            ...connection,
            authMethod: authMethod || connection.authMethod,
            managedIdentityId: managedIdentityId || connection.managedIdentityId,
        } : undefined,
        connectionString: directConnectionString,
        database,
        timeout,
        quitOnError,
    };
    // If using direct connection string, we need to handle auth separately
    if (directConnectionString && !connection) {
        // Create a temporary connection object for auth flags
        options.connection = {
            name: '_direct',
            cluster: '',
            database: database || 'default',
            authMethod,
            managedIdentityId,
        };
    }
    const result = await executeCommands(options);
    if (!result.success) {
        throw createQueryError(result.error || 'Execution failed', {
            commands,
            rawOutput: result.rawOutput,
        });
    }
    // Format output
    if (format === 'raw') {
        return result.rawOutput || '';
    }
    if (format === 'table') {
        const table = formatAsTable({
            columns: result.columns || [],
            rows: result.rows || [],
            rowCount: result.rowCount || 0,
        });
        return `Executed ${commands.length} command(s) (${result.rowCount} rows, ${result.executionTime}ms)\n\n${table}`;
    }
    return JSON.stringify({
        success: true,
        commandCount: commands.length,
        rowCount: result.rowCount,
        executionTime: result.executionTime,
        columns: result.columns,
        rows: result.rows,
    }, null, 2);
}
//# sourceMappingURL=kusto-execute.js.map