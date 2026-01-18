import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { registerTools, handleToolCall, getToolDefinitions } from './tools/index.js';
export async function createServer() {
    const server = new Server({
        name: 'kusto-mcp-server',
        version: '1.0.0',
    }, {
        capabilities: {
            tools: {},
        },
    });
    // Register tool handlers
    registerTools(server);
    // List tools handler
    server.setRequestHandler(ListToolsRequestSchema, async () => {
        return {
            tools: getToolDefinitions(),
        };
    });
    // Call tool handler
    server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
        try {
            const result = await handleToolCall(name, args ?? {});
            return {
                content: [
                    {
                        type: 'text',
                        text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
                    },
                ],
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error: ${errorMessage}`,
                    },
                ],
                isError: true,
            };
        }
    });
    return server;
}
export async function runServer() {
    const server = await createServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    // Handle shutdown gracefully
    process.on('SIGINT', async () => {
        await server.close();
        process.exit(0);
    });
    process.on('SIGTERM', async () => {
        await server.close();
        process.exit(0);
    });
}
//# sourceMappingURL=server.js.map