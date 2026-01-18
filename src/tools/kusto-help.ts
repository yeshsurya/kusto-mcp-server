import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import { getCliHelp } from '../executor/kusto-executor.js';
import { parseHelpOutput, getKnownOptions } from '../parser/help-parser.js';
import { getConfig } from '../config/index.js';

export const kustoHelpTool: Tool = {
  name: 'kusto_help',
  description: 'Get help information about the Kusto CLI and available options.',
  inputSchema: {
    type: 'object',
    properties: {
      verbose: {
        type: 'boolean',
        description: 'Include full CLI help output and all options',
      },
      category: {
        type: 'string',
        enum: ['auth', 'execution', 'output', 'security', 'all'],
        description: 'Filter options by category',
      },
    },
  },
};

export interface KustoHelpParams {
  verbose?: boolean;
  category?: 'auth' | 'execution' | 'output' | 'security' | 'all';
}

export async function handleKustoHelp(params: KustoHelpParams): Promise<string> {
  const { verbose = false, category = 'all' } = params;

  const config = getConfig();
  const knownOptions = getKnownOptions();

  // Filter options by category
  const filteredOptions = category === 'all'
    ? knownOptions
    : knownOptions.filter(opt => opt.category === category);

  // Group options by category
  const groupedOptions: Record<string, typeof knownOptions> = {};
  for (const opt of filteredOptions) {
    if (!groupedOptions[opt.category]) {
      groupedOptions[opt.category] = [];
    }
    groupedOptions[opt.category].push(opt);
  }

  const result: Record<string, unknown> = {
    cliPath: config.kustoCliPath,
    defaultTimeout: config.defaultTimeout,
    maxRows: config.maxRows,
    options: groupedOptions,
  };

  if (verbose) {
    try {
      const helpText = await getCliHelp();
      const parsed = parseHelpOutput(helpText);
      result.cliVersion = parsed.version;
      result.usage = parsed.usage;
      result.description = parsed.description;
      result.rawHelp = helpText;
      result.parsedOptions = parsed.options;
      result.examples = parsed.examples;
    } catch (error) {
      result.helpError = error instanceof Error ? error.message : String(error);
    }
  }

  // Add quick reference
  result.quickReference = {
    tools: [
      { name: 'kusto_query', description: 'Execute KQL queries (primary tool)' },
      { name: 'kusto_execute', description: 'Advanced execution with full CLI options' },
      { name: 'kusto_script', description: 'Execute script files' },
      { name: 'kusto_connection_add', description: 'Add/update a connection' },
      { name: 'kusto_connection_list', description: 'List all connections' },
      { name: 'kusto_connection_test', description: 'Test connectivity' },
      { name: 'kusto_connection_remove', description: 'Remove a connection' },
      { name: 'kusto_connection_set_default', description: 'Set default connection' },
      { name: 'kusto_schema', description: 'Get database schema' },
      { name: 'kusto_help', description: 'Show this help' },
    ],
    authMethods: [
      { method: 'azcli', description: 'Use Azure CLI credentials (run az login first)' },
      { method: 'managedIdentity', description: 'Use Azure Managed Identity (for Azure-hosted)' },
      { method: 'default', description: 'Use Azure SDK default credential chain' },
    ],
    commonQueries: [
      { description: 'Count rows in table', query: 'TableName | count' },
      { description: 'Sample data', query: 'TableName | take 10' },
      { description: 'Time-based filter', query: 'TableName | where Timestamp > ago(1h)' },
      { description: 'Aggregation', query: 'TableName | summarize count() by Column' },
      { description: 'Schema info', query: '.show table TableName schema' },
    ],
  };

  return JSON.stringify(result, null, 2);
}
