import { spawn, SpawnOptions } from 'child_process';

export interface ProcessResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export interface RunProcessOptions {
  command: string;
  args: string[];
  timeout?: number;
  cwd?: string;
  env?: Record<string, string>;
}

export async function runProcess(options: RunProcessOptions): Promise<ProcessResult> {
  const { command, args, timeout = 60000, cwd, env } = options;

  return new Promise((resolve, reject) => {
    const spawnOptions: SpawnOptions = {
      timeout,
      cwd,
      env: env ? { ...process.env, ...env } : process.env,
    };

    const childProcess = spawn(command, args, spawnOptions);

    let stdout = '';
    let stderr = '';

    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    childProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      resolve({
        stdout,
        stderr,
        exitCode: code ?? 0,
      });
    });

    childProcess.on('error', (error) => {
      reject(error);
    });
  });
}

export function escapeShellArg(arg: string): string {
  // Escape special characters for shell arguments
  return `'${arg.replace(/'/g, "'\\''")}'`;
}

export function validatePath(path: string): boolean {
  // Basic path validation - check for dangerous patterns
  const dangerousPatterns = [
    /\.\./,  // Parent directory traversal
    /^\/etc\//,  // System config
    /^\/proc\//,  // Proc filesystem
    /^\/sys\//,  // Sys filesystem
  ];

  return !dangerousPatterns.some(pattern => pattern.test(path));
}
