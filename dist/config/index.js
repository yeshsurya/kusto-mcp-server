import { homedir } from 'os';
import { existsSync } from 'fs';
export * from './connections.js';
const DEFAULT_KUSTO_CLI_PATHS = [
    process.env.KUSTO_CLI_PATH,
    `${homedir()}/.nuget/packages/microsoft.azure.kusto.tools/14.0.3/tools/net8.0/Kusto.Cli.dll`,
    `${homedir()}/.nuget/packages/microsoft.azure.kusto.tools/14.0.2/tools/net8.0/Kusto.Cli.dll`,
    `${homedir()}/.nuget/packages/microsoft.azure.kusto.tools/14.0.1/tools/net8.0/Kusto.Cli.dll`,
    '/usr/local/share/kusto-cli/Kusto.Cli.dll',
];
function findKustoCliPath() {
    for (const path of DEFAULT_KUSTO_CLI_PATHS) {
        if (path && existsSync(path)) {
            return path;
        }
    }
    throw new Error('Kusto CLI not found. Please set KUSTO_CLI_PATH environment variable or install microsoft.azure.kusto.tools NuGet package.');
}
export function loadConfig() {
    return {
        kustoCliPath: findKustoCliPath(),
        defaultTimeout: parseInt(process.env.KUSTO_DEFAULT_TIMEOUT || '60000', 10),
        maxRows: parseInt(process.env.KUSTO_MAX_ROWS || '10000', 10),
    };
}
let cachedConfig = null;
export function getConfig() {
    if (!cachedConfig) {
        cachedConfig = loadConfig();
    }
    return cachedConfig;
}
//# sourceMappingURL=index.js.map