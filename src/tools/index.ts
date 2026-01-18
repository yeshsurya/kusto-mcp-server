import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

import { kustoQueryTool, handleKustoQuery, type KustoQueryParams } from './kusto-query.js';
import { kustoExecuteTool, handleKustoExecute, type KustoExecuteParams } from './kusto-execute.js';
import { kustoScriptTool, handleKustoScript, type KustoScriptParams } from './kusto-script.js';
import {
  kustoConnectionAddTool,
  kustoConnectionListTool,
  kustoConnectionTestTool,
  kustoConnectionRemoveTool,
  kustoConnectionSetDefaultTool,
  handleConnectionAdd,
  handleConnectionList,
  handleConnectionTest,
  handleConnectionRemove,
  handleConnectionSetDefault,
  type ConnectionAddParams,
  type ConnectionTestParams,
  type ConnectionRemoveParams,
  type ConnectionSetDefaultParams,
} from './kusto-connection.js';
import { kustoSchemaTool, handleKustoSchema, type KustoSchemaParams } from './kusto-schema.js';
import { kustoHelpTool, handleKustoHelp, type KustoHelpParams } from './kusto-help.js';

// All tool definitions
const tools: Tool[] = [
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

// Tool handler type
type ToolHandler = (args: Record<string, unknown>) => Promise<string>;

// Tool handler registry
const handlers: Record<string, ToolHandler> = {
  kusto_query: (args) => handleKustoQuery(args as unknown as KustoQueryParams),
  kusto_execute: (args) => handleKustoExecute(args as unknown as KustoExecuteParams),
  kusto_script: (args) => handleKustoScript(args as unknown as KustoScriptParams),
  kusto_connection_add: (args) => handleConnectionAdd(args as unknown as ConnectionAddParams),
  kusto_connection_list: () => handleConnectionList(),
  kusto_connection_test: (args) => handleConnectionTest(args as unknown as ConnectionTestParams),
  kusto_connection_remove: (args) => handleConnectionRemove(args as unknown as ConnectionRemoveParams),
  kusto_connection_set_default: (args) => handleConnectionSetDefault(args as unknown as ConnectionSetDefaultParams),
  kusto_schema: (args) => handleKustoSchema(args as unknown as KustoSchemaParams),
  kusto_help: (args) => handleKustoHelp(args as unknown as KustoHelpParams),
};

export function getToolDefinitions(): Tool[] {
  return tools;
}

export async function handleToolCall(name: string, args: Record<string, unknown>): Promise<string> {
  const handler = handlers[name];
  if (!handler) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return handler(args);
}

export function registerTools(_server: Server): void {
  // Tools are registered via the ListToolsRequestSchema handler
  // This function can be used for any additional setup if needed
}
