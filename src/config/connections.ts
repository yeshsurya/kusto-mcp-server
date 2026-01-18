import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join, dirname } from 'path';

export type AuthMethod = 'azcli' | 'managedIdentity' | 'default';

export interface KustoConnection {
  name: string;
  cluster: string;
  database: string;
  authMethod: AuthMethod;
  managedIdentityId?: string;
  isDefault?: boolean;
}

export interface ConnectionsConfig {
  connections: KustoConnection[];
  defaultConnection?: string;
}

const CONFIG_DIR = join(homedir(), '.config', 'kusto-mcp');
const CONNECTIONS_FILE = join(CONFIG_DIR, 'connections.json');

function ensureConfigDir(): void {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

function loadConnections(): ConnectionsConfig {
  ensureConfigDir();
  if (!existsSync(CONNECTIONS_FILE)) {
    return { connections: [] };
  }
  try {
    const content = readFileSync(CONNECTIONS_FILE, 'utf-8');
    return JSON.parse(content) as ConnectionsConfig;
  } catch {
    return { connections: [] };
  }
}

function saveConnections(config: ConnectionsConfig): void {
  ensureConfigDir();
  writeFileSync(CONNECTIONS_FILE, JSON.stringify(config, null, 2), 'utf-8');
}

export function addConnection(connection: KustoConnection): void {
  const config = loadConnections();

  // Remove existing connection with same name
  config.connections = config.connections.filter(c => c.name !== connection.name);

  // Add new connection
  config.connections.push(connection);

  // Set as default if specified or if it's the first connection
  if (connection.isDefault || config.connections.length === 1) {
    config.defaultConnection = connection.name;
  }

  saveConnections(config);
}

export function removeConnection(name: string): boolean {
  const config = loadConnections();
  const initialLength = config.connections.length;
  config.connections = config.connections.filter(c => c.name !== name);

  if (config.defaultConnection === name) {
    config.defaultConnection = config.connections[0]?.name;
  }

  saveConnections(config);
  return config.connections.length < initialLength;
}

export function getConnection(name: string): KustoConnection | undefined {
  const config = loadConnections();
  return config.connections.find(c => c.name === name);
}

export function getDefaultConnection(): KustoConnection | undefined {
  const config = loadConnections();
  if (config.defaultConnection) {
    return config.connections.find(c => c.name === config.defaultConnection);
  }
  return config.connections[0];
}

export function listConnections(): KustoConnection[] {
  const config = loadConnections();
  return config.connections;
}

export function setDefaultConnection(name: string): boolean {
  const config = loadConnections();
  const connection = config.connections.find(c => c.name === name);
  if (!connection) {
    return false;
  }
  config.defaultConnection = name;
  saveConnections(config);
  return true;
}

export function buildConnectionString(connection: KustoConnection): string {
  let connStr = `Data Source=${connection.cluster};Initial Catalog=${connection.database}`;

  if (connection.authMethod === 'azcli') {
    connStr += ';Fed=true';
  } else if (connection.authMethod === 'managedIdentity') {
    connStr += ';Fed=true';
  } else {
    connStr += ';Fed=true';
  }

  return connStr;
}

export function getAuthFlags(connection: KustoConnection): string[] {
  const flags: string[] = [];

  if (connection.authMethod === 'azcli') {
    flags.push('-azcli');
  } else if (connection.authMethod === 'managedIdentity') {
    if (connection.managedIdentityId) {
      flags.push(`-managedIdentity:${connection.managedIdentityId}`);
    } else {
      flags.push('-managedIdentity');
    }
  }

  return flags;
}
