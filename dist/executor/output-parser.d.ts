export interface ParsedOutput {
    columns: string[];
    rows: Record<string, unknown>[];
    rowCount: number;
}
export declare function parseCSVOutput(output: string): ParsedOutput;
export declare function formatAsTable(parsed: ParsedOutput): string;
export declare function parseSchemaOutput(output: string): {
    tables: Array<{
        name: string;
        columns: Array<{
            name: string;
            type: string;
        }>;
    }>;
};
//# sourceMappingURL=output-parser.d.ts.map