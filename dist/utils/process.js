import { spawn } from 'child_process';
export async function runProcess(options) {
    const { command, args, timeout = 60000, cwd, env } = options;
    return new Promise((resolve, reject) => {
        const spawnOptions = {
            timeout,
            cwd,
            env: env ? { ...process.env, ...env } : process.env,
        };
        const childProcess = spawn(command, args, spawnOptions);
        let stdout = '';
        let stderr = '';
        childProcess.stdout?.on('data', (data) => {
            stdout += data.toString();
        });
        childProcess.stderr?.on('data', (data) => {
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
export function escapeShellArg(arg) {
    // Escape special characters for shell arguments
    return `'${arg.replace(/'/g, "'\\''")}'`;
}
export function validatePath(path) {
    // Basic path validation - check for dangerous patterns
    const dangerousPatterns = [
        /\.\./, // Parent directory traversal
        /^\/etc\//, // System config
        /^\/proc\//, // Proc filesystem
        /^\/sys\//, // Sys filesystem
    ];
    return !dangerousPatterns.some(pattern => pattern.test(path));
}
//# sourceMappingURL=process.js.map