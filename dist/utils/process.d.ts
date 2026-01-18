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
export declare function runProcess(options: RunProcessOptions): Promise<ProcessResult>;
export declare function escapeShellArg(arg: string): string;
export declare function validatePath(path: string): boolean;
//# sourceMappingURL=process.d.ts.map