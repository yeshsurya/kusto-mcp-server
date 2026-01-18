function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    while (i < line.length) {
        const char = line[i];
        if (inQuotes) {
            if (char === '"') {
                // Check for escaped quote
                if (i + 1 < line.length && line[i + 1] === '"') {
                    current += '"';
                    i += 2;
                    continue;
                }
                else {
                    inQuotes = false;
                    i++;
                    continue;
                }
            }
            else {
                current += char;
            }
        }
        else {
            if (char === '"') {
                inQuotes = true;
            }
            else if (char === ',') {
                values.push(current);
                current = '';
            }
            else {
                current += char;
            }
        }
        i++;
    }
    values.push(current);
    return values;
}
function coerceValue(value) {
    const trimmed = value.trim();
    // Empty or null values
    if (trimmed === '' || trimmed.toLowerCase() === 'null') {
        return null;
    }
    // Boolean values
    if (trimmed.toLowerCase() === 'true') {
        return true;
    }
    if (trimmed.toLowerCase() === 'false') {
        return false;
    }
    // Integer values
    if (/^-?\d+$/.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        if (Number.isSafeInteger(num)) {
            return num;
        }
        return trimmed; // Keep as string if too large
    }
    // Float values
    if (/^-?\d+\.\d+$/.test(trimmed)) {
        return parseFloat(trimmed);
    }
    // Scientific notation
    if (/^-?\d+\.?\d*[eE][+-]?\d+$/.test(trimmed)) {
        return parseFloat(trimmed);
    }
    // ISO datetime values
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
        return trimmed; // Keep as ISO string
    }
    // JSON-like values (arrays or objects)
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) ||
        (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        try {
            return JSON.parse(trimmed);
        }
        catch {
            return trimmed;
        }
    }
    return trimmed;
}
export function parseCSVOutput(output) {
    const lines = output.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
        return { columns: [], rows: [], rowCount: 0 };
    }
    // First line is the header
    const columns = parseCSVLine(lines[0]);
    // Remaining lines are data rows
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row = {};
        for (let j = 0; j < columns.length; j++) {
            row[columns[j]] = coerceValue(values[j] ?? '');
        }
        rows.push(row);
    }
    return {
        columns,
        rows,
        rowCount: rows.length,
    };
}
export function formatAsTable(parsed) {
    if (parsed.columns.length === 0) {
        return 'No results';
    }
    // Calculate column widths
    const widths = parsed.columns.map(col => col.length);
    for (const row of parsed.rows) {
        for (let i = 0; i < parsed.columns.length; i++) {
            const value = String(row[parsed.columns[i]] ?? '');
            widths[i] = Math.max(widths[i], value.length);
        }
    }
    // Cap widths at reasonable maximum
    const maxWidth = 50;
    const cappedWidths = widths.map(w => Math.min(w, maxWidth));
    // Build header
    let table = parsed.columns.map((col, i) => col.padEnd(cappedWidths[i])).join(' | ') + '\n';
    table += cappedWidths.map(w => '-'.repeat(w)).join('-+-') + '\n';
    // Build rows
    for (const row of parsed.rows) {
        const rowStr = parsed.columns.map((col, i) => {
            const value = String(row[col] ?? '');
            const truncated = value.length > cappedWidths[i]
                ? value.substring(0, cappedWidths[i] - 3) + '...'
                : value;
            return truncated.padEnd(cappedWidths[i]);
        }).join(' | ');
        table += rowStr + '\n';
    }
    return table;
}
export function parseSchemaOutput(output) {
    const parsed = parseCSVOutput(output);
    const tables = new Map();
    for (const row of parsed.rows) {
        const tableName = String(row['TableName'] ?? row['tablename'] ?? '');
        const columnName = String(row['ColumnName'] ?? row['columnname'] ?? row['Name'] ?? row['name'] ?? '');
        const columnType = String(row['ColumnType'] ?? row['columntype'] ?? row['Type'] ?? row['type'] ?? 'unknown');
        if (tableName && columnName) {
            if (!tables.has(tableName)) {
                tables.set(tableName, []);
            }
            tables.get(tableName).push({ name: columnName, type: columnType });
        }
    }
    return {
        tables: Array.from(tables.entries()).map(([name, columns]) => ({ name, columns })),
    };
}
//# sourceMappingURL=output-parser.js.map