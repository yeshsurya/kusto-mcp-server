import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';
const CONFIG_DIR = join(homedir(), '.config', 'kusto-mcp');
const CONNECTIONS_FILE = join(CONFIG_DIR, 'connections.json');
function ensureConfigDir() {
    if (!existsSync(CONFIG_DIR)) {
        mkdirSync(CONFIG_DIR, { recursive: true });
    }
}
function loadConnections() {
    ensureConfigDir();
    if (!existsSync(CONNECTIONS_FILE)) {
        return { connections: [] };
    }
    try {
        const content = readFileSync(CONNECTIONS_FILE, 'utf-8');
        return JSON.parse(content);
    }
    catch {
        return { connections: [] };
    }
}
function saveConnections(config) {
    ensureConfigDir();
    writeFileSync(CONNECTIONS_FILE, JSON.stringify(config, null, 2), 'utf-8');
}
export function addConnection(connection) {
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
export function removeConnection(name) {
    const config = loadConnections();
    const initialLength = config.connections.length;
    config.connections = config.connections.filter(c => c.name !== name);
    if (config.defaultConnection === name) {
        config.defaultConnection = config.connections[0]?.name;
    }
    saveConnections(config);
    return config.connections.length < initialLength;
}
export function getConnection(name) {
    const config = loadConnections();
    return config.connections.find(c => c.name === name);
}
export function getDefaultConnection() {
    const config = loadConnections();
    if (config.defaultConnection) {
        return config.connections.find(c => c.name === config.defaultConnection);
    }
    return config.connections[0];
}
export function listConnections() {
    const config = loadConnections();
    return config.connections;
}
export function setDefaultConnection(name) {
    const config = loadConnections();
    const connection = config.connections.find(c => c.name === name);
    if (!connection) {
        return false;
    }
    config.defaultConnection = name;
    saveConnections(config);
    return true;
}
export function buildConnectionString(connection) {
    let connStr = `Data Source=${connection.cluster};Initial Catalog=${connection.database}`;
    if (connection.authMethod === 'azcli') {
        connStr += ';Fed=true';
    }
    else if (connection.authMethod === 'managedIdentity') {
        connStr += ';Fed=true';
    }
    else {
        connStr += ';Fed=true';
    }
    return connStr;
}
export function getAuthFlags(connection) {
    const flags = [];
    if (connection.authMethod === 'azcli') {
        flags.push('-azcli');
    }
    else if (connection.authMethod === 'managedIdentity') {
        if (connection.managedIdentityId) {
            flags.push(`-managedIdentity:${connection.managedIdentityId}`);
        }
        else {
            flags.push('-managedIdentity');
        }
    }
    return flags;
}
//# sourceMappingURL=connections.js.map