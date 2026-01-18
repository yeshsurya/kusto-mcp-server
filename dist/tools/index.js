import { kustoQueryTool, handleKustoQuery } from './kusto-query.js';
import { kustoExecuteTool, handleKustoExecute } from './kusto-execute.js';
import { kustoScriptTool, handleKustoScript } from './kusto-script.js';
import { kustoConnectionAddTool, kustoConnectionListTool, kustoConnectionTestTool, kustoConnectionRemoveTool, kustoConnectionSetDefaultTool, handleConnectionAdd, handleConnectionList, handleConnectionTest, handleConnectionRemove, handleConnectionSetDefault, } from './kusto-connection.js';
import { kustoSchemaTool, handleKustoSchema } from './kusto-schema.js';
import { kustoHelpTool, handleKustoHelp } from './kusto-help.js';
// All tool definitions
const tools = [
    kustoQueryTool,
    kustoExecuteTool,
    kustoScriptTool,
    kustoConnectionAddTool,
    kustoConnectionListTool,
    kustoConnectionTestTool,
    kustoConnectionRemoveTool,
    kustoConnectionSetDefaultTool,
    kustoSchemaTool,
    kustoHelpTool,
];
// Tool handler registry
const handlers = {
    kusto_query: (args) => handleKustoQuery(args),
    kusto_execute: (args) => handleKustoExecute(args),
    kusto_script: (args) => handleKustoScript(args),
    kusto_connection_add: (args) => handleConnectionAdd(args),
    kusto_connection_list: () => handleConnectionList(),
    kusto_connection_test: (args) => handleConnectionTest(args),
    kusto_connection_remove: (args) => handleConnectionRemove(args),
    kusto_connection_set_default: (args) => handleConnectionSetDefault(args),
    kusto_schema: (args) => handleKustoSchema(args),
    kusto_help: (args) => handleKustoHelp(args),
};
export function getToolDefinitions() {
    return tools;
}
export async function handleToolCall(name, args) {
    const handler = handlers[name];
    if (!handler) {
        throw new Error(`Unknown tool: ${name}`);
    }
    return handler(args);
}
export function registerTools(_server) {
    // Tools are registered via the ListToolsRequestSchema handler
    // This function can be used for any additional setup if needed
}
//# sourceMappingURL=index.js.map