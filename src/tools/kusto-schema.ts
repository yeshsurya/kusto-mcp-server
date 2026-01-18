import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { executeQuery } from '../executor/kusto-executor.js';
import { getConnection, getDefaultConnection } from '../config/connections.js';
import { createConnectionError, createQueryError, createValidationError } from '../utils/error-handler.js';

export const kustoSchemaTool: Tool = {
  name: 'kusto_schema',
  description: 'Get database schema information including tables, columns, and their types.',
  inputSchema: {
    type: 'object',
    properties: {
      scope: {
        type: 'string',
        enum: ['databases', 'tables', 'table', 'functions'],
        description: 'Scope of schema to retrieve. "databases" lists all databases, "tables" lists all tables, "table" gets schema for specific table, "functions" lists functions.',
      },
      tableName: {
        type: 'string',
        description: 'Table name (required when scope is "table")',
      },
      connectionName: {
        type: 'string',
        description: 'Name of a saved connection to use',
      },
      database: {
        type: 'string',
        description: 'Database name (overrides connection default)',
      },
    },
    required: ['scope'],
  },
};

export interface KustoSchemaParams {
  scope: 'databases' | 'tables' | 'table' | 'functions';
  tableName?: string;
  connectionName?: string;
  database?: string;
}

const SCHEMA_QUERIES = {
  databases: '.show databases | project DatabaseName, PrettyName',
  tables: '.show tables | project TableName, Folder, DocString',
  functions: '.show functions | project Name, Parameters, Body, Folder',
};

function getTableSchemaQuery(tableName: string): string {
  // Escape the table name to prevent injection
  const escapedName = tableName.replace(/['"]/g, '');
  return `.show table ['${escapedName}'] schema as json`;
}

export async function handleKustoSchema(params: KustoSchemaParams): Promise<string> {
  const { scope, tableName, connectionName, database } = params;

  // Validate parameters
  if (scope === 'table' && (!tableName || tableName.trim() === '')) {
    throw createValidationError('tableName is required when scope is "table"', 'tableName');
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

  // Build query
  let query: string;
  if (scope === 'table') {
    query = getTableSchemaQuery(tableName!);
  } else {
    query = SCHEMA_QUERIES[scope];
  }

  // Execute query
  const result = await executeQuery(query, {
    connection,
    database,
    timeout: 30000,
  });

  if (!result.success) {
    throw createQueryError(result.error || 'Schema query failed', {
      scope,
      tableName,
      rawOutput: result.rawOutput,
    });
  }

  // Format response based on scope
  if (scope === 'databases') {
    return JSON.stringify({
      success: true,
      scope,
      databases: result.rows?.map(row => ({
        name: row.DatabaseName,
        prettyName: row.PrettyName,
      })) || [],
    }, null, 2);
  }

  if (scope === 'tables') {
    return JSON.stringify({
      success: true,
      scope,
      tables: result.rows?.map(row => ({
        name: row.TableName,
        folder: row.Folder,
        description: row.DocString,
      })) || [],
    }, null, 2);
  }

  if (scope === 'functions') {
    return JSON.stringify({
      success: true,
      scope,
      functions: result.rows?.map(row => ({
        name: row.Name,
        parameters: row.Parameters,
        body: row.Body,
        folder: row.Folder,
      })) || [],
    }, null, 2);
  }

  // Table schema (JSON format from Kusto)
  if (scope === 'table') {
    // The result is already JSON schema from Kusto
    try {
      const schemaData = result.rows?.[0];
      if (schemaData && typeof schemaData === 'object') {
        return JSON.stringify({
          success: true,
          scope,
          tableName,
          schema: schemaData,
        }, null, 2);
      }
    } catch {
      // Fall back to raw data
    }

    return JSON.stringify({
      success: true,
      scope,
      tableName,
      columns: result.columns,
      rows: result.rows,
    }, null, 2);
  }

  return JSON.stringify({
    success: true,
    scope,
    columns: result.columns,
    rows: result.rows,
  }, null, 2);
}
