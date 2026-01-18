import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeQuery } from '../executor/kusto-executor.js';
import { getConnection, getDefaultConnection } from '../config/connections.js';
import { formatAsTable } from '../executor/output-parser.js';
import { createConnectionError, createQueryError, createValidationError } from '../utils/error-handler.js';

export const kustoQueryTool: Tool = {
  name: 'kusto_query',
  description: 'Execute a KQL (Kusto Query Language) query against an Azure Data Explorer cluster. This is the primary tool for running queries.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The KQL query to execute',
      },
      connectionName: {
        type: 'string',
        description: 'Name of a saved connection to use. If not specified, uses the default connection.',
      },
      database: {
        type: 'string',
        description: 'Database name to query. Overrides the database in the connection.',
      },
      maxRows: {
        type: 'number',
        description: 'Maximum number of rows to return (default: 10000)',
      },
      timeout: {
        type: 'number',
        description: 'Query timeout in milliseconds (default: 60000)',
      },
      format: {
        type: 'string',
        enum: ['json', 'table', 'raw'],
        description: 'Output format: json (structured), table (formatted text), or raw (CSV)',
      },
    },
    required: ['query'],
  },
};

export interface KustoQueryParams {
  query: string;
  connectionName?: string;
  database?: string;
  maxRows?: number;
  timeout?: number;
  format?: 'json' | 'table' | 'raw';
}

export async function handleKustoQuery(params: KustoQueryParams): Promise<string> {
  const { query, connectionName, database, maxRows, timeout, format = 'json' } = params;

  if (!query || query.trim() === '') {
    throw createValidationError('Query cannot be empty', 'query');
  }

  // Get connection
  let connection;
  if (connectionName) {
    connection = getConnection(connectionName);
    if (!connection) {
      throw createConnectionError(connectionName);
    }
  } else {
    connection = getDefaultConnection();
    if (!connection) {
      throw createValidationError(
        'No connection specified and no default connection configured. Use kusto_connection_add to create a connection.',
        'connectionName'
      );
    }
  }

  // Execute query
  const result = await executeQuery(query, {
    connection,
    database,
    maxRows,
    timeout,
  });

  if (!result.success) {
    throw createQueryError(result.error || 'Query execution failed', {
      query,
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
    return `Query executed successfully (${result.rowCount} rows, ${result.executionTime}ms)\n\n${table}`;
  }

  // JSON format (default)
  return JSON.stringify({
    success: true,
    rowCount: result.rowCount,
    executionTime: result.executionTime,
    columns: result.columns,
    rows: result.rows,
  }, null, 2);
}
