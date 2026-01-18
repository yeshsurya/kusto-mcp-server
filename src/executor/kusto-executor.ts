import { spawn } from 'child_process';
import { getConfig } from '../config/index.js';
import type { KustoConnection } from '../config/connections.js';
import { buildConnectionString, getAuthFlags } from '../config/connections.js';
import type { KustoQueryOptions, KustoExecutionResult } from '../parser/option-types.js';
import { parseCSVOutput } from './output-parser.js';

export interface ExecuteOptions extends KustoQueryOptions {
  connection?: KustoConnection;
  connectionString?: string;
  database?: string;
}

export interface ExecuteCommandOptions extends ExecuteOptions {
  commands: string[];
}

export interface ExecuteScriptOptions extends ExecuteOptions {
  scriptPath: string;
}

function buildBaseArgs(options: ExecuteOptions): string[] {
  const args: string[] = [];

  // Connection string
  if (options.connectionString) {
    args.push(options.connectionString);
  } else if (options.connection) {
    args.push(buildConnectionString(options.connection));
  }

  // Auth flags
  if (options.connection) {
    args.push(...getAuthFlags(options.connection));
  }

  // Database override
  if (options.database) {
    args.push(`-database:${options.database}`);
  }

  // Output mode flags - always use scripted mode for machine-readable output
  if (options.scripted !== false) {
    args.push('-scripted');
  }
  if (options.headless !== false) {
    args.push('-headless');
  }
  if (options.noProgress !== false) {
    args.push('-noProgress');
  }

  // Execution options
  if (options.timeout) {
    args.push(`-timeout:${options.timeout}`);
  }
  if (options.quitOnError) {
    args.push('-quitOnError');
  }
  if (options.multiLine) {
    args.push('-multiLine');
  }
  if (options.maxRows) {
    args.push(`-lineMode:${options.maxRows}`);
  }

  return args;
}

async function executeKustoCli(args: string[], timeout: number = 60000): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  const config = getConfig();

  return new Promise((resolve, reject) => {
    const process = spawn('dotnet', [config.kustoCliPath, ...args], {
      timeout,
      env: {
        ...globalThis.process.env,
        DOTNET_NOLOGO: '1',
      },
    });

    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 0,
      });
    });

    process.on('error', (error) => {
      reject(error);
    });
  });
}

export async function executeQuery(query: string, options: ExecuteOptions): Promise<KustoExecutionResult> {
  const args = buildBaseArgs(options);
  args.push(`-execute:${query}`);

  const startTime = Date.now();

  try {
    const result = await executeKustoCli(args, options.timeout);
    const executionTime = Date.now() - startTime;

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || `CLI exited with code ${result.exitCode}`,
        rawOutput: result.stdout,
        executionTime,
      };
    }

    const parsed = parseCSVOutput(result.stdout);
    return {
      success: true,
      columns: parsed.columns,
      rows: parsed.rows,
      rowCount: parsed.rowCount,
      rawOutput: result.stdout,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
    };
  }
}

export async function executeCommands(options: ExecuteCommandOptions): Promise<KustoExecutionResult> {
  const args = buildBaseArgs(options);

  // Add each command as a separate -execute flag
  for (const command of options.commands) {
    args.push(`-execute:${command}`);
  }

  const startTime = Date.now();

  try {
    const result = await executeKustoCli(args, options.timeout);
    const executionTime = Date.now() - startTime;

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || `CLI exited with code ${result.exitCode}`,
        rawOutput: result.stdout,
        executionTime,
      };
    }

    const parsed = parseCSVOutput(result.stdout);
    return {
      success: true,
      columns: parsed.columns,
      rows: parsed.rows,
      rowCount: parsed.rowCount,
      rawOutput: result.stdout,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
    };
  }
}

export async function executeScript(options: ExecuteScriptOptions): Promise<KustoExecutionResult> {
  const args = buildBaseArgs(options);
  args.push(`-script:${options.scriptPath}`);

  const startTime = Date.now();

  try {
    const result = await executeKustoCli(args, options.timeout);
    const executionTime = Date.now() - startTime;

    if (result.exitCode !== 0) {
      return {
        success: false,
        error: result.stderr || `CLI exited with code ${result.exitCode}`,
        rawOutput: result.stdout,
        executionTime,
      };
    }

    const parsed = parseCSVOutput(result.stdout);
    return {
      success: true,
      columns: parsed.columns,
      rows: parsed.rows,
      rowCount: parsed.rowCount,
      rawOutput: result.stdout,
      executionTime,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      executionTime: Date.now() - startTime,
    };
  }
}

export async function getCliHelp(): Promise<string> {
  const config = getConfig();

  try {
    const result = await executeKustoCli(['-help'], 10000);
    return result.stdout || result.stderr;
  } catch (error) {
    return `Error getting help: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export async function testConnection(options: ExecuteOptions): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const startTime = Date.now();

  try {
    const result = await executeQuery('print "Connection test successful"', {
      ...options,
      timeout: 30000,
    });

    const latencyMs = Date.now() - startTime;

    if (result.success) {
      return {
        success: true,
        message: 'Connection successful',
        latencyMs,
      };
    } else {
      return {
        success: false,
        message: result.error || 'Unknown connection error',
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
