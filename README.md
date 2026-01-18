# Kusto MCP Server

An MCP (Model Context Protocol) server that provides tools for interacting with Azure Data Explorer (Kusto) clusters.

## Prerequisites

- Node.js 18+
- .NET 8 Runtime
- Kusto CLI (`microsoft.azure.kusto.tools` NuGet package)
- Azure CLI (for authentication)

## Installation

### 1. Install the Kusto CLI

```bash
dotnet tool install -g Microsoft.Azure.Kusto.Tools
```

Or via NuGet:
```bash
nuget install microsoft.azure.kusto.tools -Version 14.0.3
```

### 2. Install the MCP Server

```bash
cd kusto-mcp-server
npm install
npm run build
```

### 3. Add to Claude Code (CLI)

```bash
claude mcp add kusto node /path/to/kusto-mcp-server/dist/index.js
```

Verify it's connected:
```bash
claude mcp list
```

### Alternative: Manual Configuration (Claude Desktop)

Add to your Claude Desktop configuration:
- Linux: `~/.config/claude/claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "kusto": {
      "command": "node",
      "args": ["/path/to/kusto-mcp-server/dist/index.js"],
      "env": {
        "KUSTO_CLI_PATH": "~/.nuget/packages/microsoft.azure.kusto.tools/14.0.3/tools/net8.0/Kusto.Cli.dll"
      }
    }
  }
}
```

## Authentication

Before using the server, authenticate with Azure:

```bash
az login
```

## Available Tools

### Query Tools

| Tool | Description |
|------|-------------|
| `kusto_query` | Execute KQL queries (primary tool) |
| `kusto_execute` | Advanced execution with full CLI options |
| `kusto_script` | Execute script files |

### Connection Management

| Tool | Description |
|------|-------------|
| `kusto_connection_add` | Add/update a named connection |
| `kusto_connection_list` | List all configured connections |
| `kusto_connection_test` | Test connectivity |
| `kusto_connection_remove` | Remove a connection |
| `kusto_connection_set_default` | Set the default connection |

### Schema & Help

| Tool | Description |
|------|-------------|
| `kusto_schema` | Get database schema information |
| `kusto_help` | Get help and CLI options |

## Usage Examples

### Add a Connection

```
kusto_connection_add({
  name: "my-cluster",
  cluster: "https://mycluster.kusto.windows.net",
  database: "MyDatabase",
  authMethod: "azcli",
  isDefault: true
})
```

### Execute a Query

```
kusto_query({
  query: "StormEvents | summarize count() by State | top 10 by count_",
  connectionName: "my-cluster"
})
```

### Get Schema

```
kusto_schema({
  scope: "tables",
  connectionName: "my-cluster"
})
```

### Execute Multiple Commands

```
kusto_execute({
  commands: [
    ".show tables",
    "StormEvents | count"
  ],
  connectionName: "my-cluster"
})
```

## Configuration

Environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `KUSTO_CLI_PATH` | Path to Kusto.Cli.dll | Auto-detected |
| `KUSTO_DEFAULT_TIMEOUT` | Default query timeout (ms) | 60000 |
| `KUSTO_MAX_ROWS` | Default max rows | 10000 |

## Development

```bash
# Build
npm run build

# Watch mode
npm run dev

# Run tests
npm test
```

## License

MIT
