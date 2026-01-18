import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';
export declare function getToolDefinitions(): Tool[];
export declare function handleToolCall(name: string, args: Record<string, unknown>): Promise<string>;
export declare function registerTools(_server: Server): void;
//# sourceMappingURL=index.d.ts.map