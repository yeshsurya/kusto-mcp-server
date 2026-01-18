export type OptionCategory = 'auth' | 'execution' | 'output' | 'security' | 'other';
export interface CliOption {
    name: string;
    shortForm?: string;
    description: string;
    hasValue: boolean;
    valueType?: 'string' | 'number' | 'boolean' | 'path';
    valueName?: string;
    defaultValue?: string;
    category: OptionCategory;
    required?: boolean;
}
export interface ParsedHelp {
    version?: string;
    description: string;
    usage: string;
    options: CliOption[];
    examples: string[];
}
export interface KustoQueryOptions {
    timeout?: number;
    maxRows?: number;
    scripted?: boolean;
    headless?: boolean;
    noProgress?: boolean;
    quitOnError?: boolean;
    multiLine?: boolean;
}
export interface KustoExecutionResult {
    success: boolean;
    columns?: string[];
    rows?: Record<string, unknown>[];
    rowCount?: number;
    error?: string;
    rawOutput?: string;
    executionTime?: number;
}
export interface KustoSchemaResult {
    success: boolean;
    databases?: DatabaseSchema[];
    tables?: TableSchema[];
    error?: string;
}
export interface DatabaseSchema {
    name: string;
    tables: string[];
}
export interface TableSchema {
    name: string;
    columns: ColumnSchema[];
}
export interface ColumnSchema {
    name: string;
    type: string;
}
//# sourceMappingURL=option-types.d.ts.map