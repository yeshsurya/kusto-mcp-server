import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { existsSync } from 'fs';
import { executeScript } from '../executor/kusto-executor.js';
import { getConnection, getDefaultConnection } from '../config/connections.js';
import { formatAsTable } from '../executor/output-parser.js';
import { createConnectionError, createQueryError, createValidationError, KustoMcpError, ErrorCodes } from '../utils/error-handler.js';
import { validatePath } from '../utils/process.js';

export const kustoScriptTool: Tool = {
  name: 'kusto_script',
  description: 'Execute a Kusto script file containing multiple KQL statements. Useful for running saved queries or batch operations.',
  inputSchema: {
    type: 'object',
    properties: {
      scriptPath: {
        type: 'string',
        description: 'Path to the script file containing KQL statements',
      },
      connectionName: {
        type: 'string',
        description: 'Name of a saved connection to use',
      },
      database: {
        type: 'string',
        description: 'Database name (overrides connection default)',
      },
      multiLine: {
        type: 'boolean',
        description: 'Enable multi-line mode for statements spanning multiple lines',
      },
      quitOnError: {
        type: 'boolean',
        description: 'Stop execution on first error',
      },
      timeout: {
        type: 'number',
        description: 'Execution timeout in milliseconds',
      },
      format: {
        type: 'string',
        enum: ['json', 'table', 'raw'],
        description: 'Output format',
      },
    },
    required: ['scriptPath'],
  },
};

export interface KustoScriptParams {
  scriptPath: string;
  connectionName?: string;
  database?: string;
  multiLine?: boolean;
  quitOnError?: boolean;
  timeout?: number;
  format?: 'json' | 'table' | 'raw';
}

export async function handleKustoScript(params: KustoScriptParams): Promise<string> {
  const {
    scriptPath,
    connectionName,
    database,
    multiLine,
    quitOnError,
    timeout,
    format = 'json',
  } = params;

  if (!scriptPath || scriptPath.trim() === '') {
    throw createValidationError('Script path cannot be empty', 'scriptPath');
  }

  // Validate path
  if (!validatePath(scriptPath)) {
    throw createValidationError('Invalid script path', 'scriptPath');
  }

  // Check if file exists
  if (!existsSync(scriptPath)) {
    throw new KustoMcpError(
      `Script file not found: ${scriptPath}`,
      ErrorCodes.SCRIPT_NOT_FOUND,
      { scriptPath }
    );
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
        'No connection specified and no default connection configured.',
        'connectionName'
      );
    }
  }

  const result = await executeScript({
    scriptPath,
    connection,
    database,
    multiLine,
    quitOnError,
    timeout,
  });

  if (!result.success) {
    throw createQueryError(result.error || 'Script execution failed', {
      scriptPath,
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
    return `Script executed successfully (${result.rowCount} rows, ${result.executionTime}ms)\n\n${table}`;
  }

  return JSON.stringify({
    success: true,
    scriptPath,
    rowCount: result.rowCount,
    executionTime: result.executionTime,
    columns: result.columns,
    rows: result.rows,
  }, null, 2);
}
