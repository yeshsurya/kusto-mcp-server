import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  addConnection,
  removeConnection,
  getConnection,
  listConnections,
  setDefaultConnection,
  type AuthMethod,
  type KustoConnection,
} from '../config/connections.js';
import { testConnection } from '../executor/kusto-executor.js';
import { createConnectionError, createValidationError } from '../utils/error-handler.js';

export const kustoConnectionAddTool: Tool = {
  name: 'kusto_connection_add',
  description: 'Add or update a named connection configuration for Azure Data Explorer.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Unique name for this connection',
      },
      cluster: {
        type: 'string',
        description: 'Cluster URL (e.g., https://mycluster.kusto.windows.net)',
      },
      database: {
        type: 'string',
        description: 'Default database name',
      },
      authMethod: {
        type: 'string',
        enum: ['azcli', 'managedIdentity', 'default'],
        description: 'Authentication method. azcli uses Azure CLI credentials, managedIdentity uses Azure Managed Identity.',
      },
      managedIdentityId: {
        type: 'string',
        description: 'Client ID for managed identity (optional, uses system-assigned if not specified)',
      },
      isDefault: {
        type: 'boolean',
        description: 'Set this as the default connection',
      },
    },
    required: ['name', 'cluster', 'database'],
  },
};

export const kustoConnectionListTool: Tool = {
  name: 'kusto_connection_list',
  description: 'List all configured Kusto connections.',
  inputSchema: {
    type: 'object',
    properties: {},
  },
};

export const kustoConnectionTestTool: Tool = {
  name: 'kusto_connection_test',
  description: 'Test connectivity to a Kusto cluster using a saved connection.',
  inputSchema: {
    type: 'object',
    properties: {
      connectionName: {
        type: 'string',
        description: 'Name of the connection to test. Uses default if not specified.',
      },
    },
  },
};

export const kustoConnectionRemoveTool: Tool = {
  name: 'kusto_connection_remove',
  description: 'Remove a saved connection configuration.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the connection to remove',
      },
    },
    required: ['name'],
  },
};

export const kustoConnectionSetDefaultTool: Tool = {
  name: 'kusto_connection_set_default',
  description: 'Set a connection as the default.',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'Name of the connection to set as default',
      },
    },
    required: ['name'],
  },
};

export interface ConnectionAddParams {
  name: string;
  cluster: string;
  database: string;
  authMethod?: AuthMethod;
  managedIdentityId?: string;
  isDefault?: boolean;
}

export interface ConnectionTestParams {
  connectionName?: string;
}

export interface ConnectionRemoveParams {
  name: string;
}

export interface ConnectionSetDefaultParams {
  name: string;
}

export async function handleConnectionAdd(params: ConnectionAddParams): Promise<string> {
  const { name, cluster, database, authMethod = 'azcli', managedIdentityId, isDefault } = params;

  if (!name || name.trim() === '') {
    throw createValidationError('Connection name cannot be empty', 'name');
  }

  if (!cluster || cluster.trim() === '') {
    throw createValidationError('Cluster URL cannot be empty', 'cluster');
  }

  if (!database || database.trim() === '') {
    throw createValidationError('Database name cannot be empty', 'database');
  }

  // Validate cluster URL format
  if (!cluster.startsWith('https://')) {
    throw createValidationError('Cluster URL must start with https://', 'cluster');
  }

  const connection: KustoConnection = {
    name: name.trim(),
    cluster: cluster.trim(),
    database: database.trim(),
    authMethod,
    managedIdentityId,
    isDefault,
  };

  addConnection(connection);

  return JSON.stringify({
    success: true,
    message: `Connection '${name}' saved successfully`,
    connection: {
      name: connection.name,
      cluster: connection.cluster,
      database: connection.database,
      authMethod: connection.authMethod,
      isDefault: connection.isDefault || false,
    },
  }, null, 2);
}

export async function handleConnectionList(): Promise<string> {
  const connections = listConnections();

  if (connections.length === 0) {
    return JSON.stringify({
      success: true,
      message: 'No connections configured. Use kusto_connection_add to create one.',
      connections: [],
    }, null, 2);
  }

  return JSON.stringify({
    success: true,
    connections: connections.map(c => ({
      name: c.name,
      cluster: c.cluster,
      database: c.database,
      authMethod: c.authMethod,
      isDefault: c.isDefault || false,
    })),
  }, null, 2);
}

export async function handleConnectionTest(params: ConnectionTestParams): Promise<string> {
  const { connectionName } = params;

  let connection;
  if (connectionName) {
    connection = getConnection(connectionName);
    if (!connection) {
      throw createConnectionError(connectionName);
    }
  } else {
    const connections = listConnections();
    connection = connections.find(c => c.isDefault) || connections[0];
    if (!connection) {
      throw createValidationError(
        'No connections configured. Use kusto_connection_add to create one.',
        'connectionName'
      );
    }
  }

  const result = await testConnection({ connection });

  return JSON.stringify({
    success: result.success,
    connectionName: connection.name,
    cluster: connection.cluster,
    database: connection.database,
    message: result.message,
    latencyMs: result.latencyMs,
  }, null, 2);
}

export async function handleConnectionRemove(params: ConnectionRemoveParams): Promise<string> {
  const { name } = params;

  if (!name || name.trim() === '') {
    throw createValidationError('Connection name cannot be empty', 'name');
  }

  const removed = removeConnection(name);

  if (!removed) {
    throw createConnectionError(name);
  }

  return JSON.stringify({
    success: true,
    message: `Connection '${name}' removed successfully`,
  }, null, 2);
}

export async function handleConnectionSetDefault(params: ConnectionSetDefaultParams): Promise<string> {
  const { name } = params;

  if (!name || name.trim() === '') {
    throw createValidationError('Connection name cannot be empty', 'name');
  }

  const success = setDefaultConnection(name);

  if (!success) {
    throw createConnectionError(name);
  }

  return JSON.stringify({
    success: true,
    message: `Connection '${name}' set as default`,
  }, null, 2);
}
