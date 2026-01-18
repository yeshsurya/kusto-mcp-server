import { parseCSVOutput, formatAsTable } from '../../src/executor/output-parser.js';

describe('parseCSVOutput', () => {
  it('should parse simple CSV output', () => {
    const csv = `Name,Age,Active
Alice,30,true
Bob,25,false`;

    const result = parseCSVOutput(csv);

    expect(result.columns).toEqual(['Name', 'Age', 'Active']);
    expect(result.rowCount).toBe(2);
    expect(result.rows[0]).toEqual({ Name: 'Alice', Age: 30, Active: true });
    expect(result.rows[1]).toEqual({ Name: 'Bob', Age: 25, Active: false });
  });

  it('should handle quoted values with commas', () => {
    const csv = `Name,Description
"Smith, John","A person named John"`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0]).toEqual({
      Name: 'Smith, John',
      Description: 'A person named John',
    });
  });

  it('should handle escaped quotes in values', () => {
    const csv = `Name,Quote
Alice,"She said ""Hello"""`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0].Quote).toBe('She said "Hello"');
  });

  it('should coerce numeric values', () => {
    const csv = `Int,Float,Scientific
42,3.14,1.5e10`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0]).toEqual({
      Int: 42,
      Float: 3.14,
      Scientific: 1.5e10,
    });
  });

  it('should handle null values', () => {
    const csv = `Name,Value
Test,null
Test2,`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0].Value).toBeNull();
    expect(result.rows[1].Value).toBeNull();
  });

  it('should handle empty input', () => {
    const result = parseCSVOutput('');

    expect(result.columns).toEqual([]);
    expect(result.rows).toEqual([]);
    expect(result.rowCount).toBe(0);
  });

  it('should handle ISO datetime strings', () => {
    const csv = `Timestamp
2024-01-15T10:30:00.000Z`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0].Timestamp).toBe('2024-01-15T10:30:00.000Z');
  });

  it('should parse JSON arrays in values', () => {
    const csv = `Name,Tags
Test,"[""tag1"",""tag2""]"`;

    const result = parseCSVOutput(csv);

    expect(result.rows[0].Tags).toEqual(['tag1', 'tag2']);
  });
});

describe('formatAsTable', () => {
  it('should format data as a text table', () => {
    const data = {
      columns: ['Name', 'Age'],
      rows: [
        { Name: 'Alice', Age: 30 },
        { Name: 'Bob', Age: 25 },
      ],
      rowCount: 2,
    };

    const table = formatAsTable(data);

    expect(table).toContain('Name');
    expect(table).toContain('Age');
    expect(table).toContain('Alice');
    expect(table).toContain('30');
    expect(table).toContain('Bob');
    expect(table).toContain('25');
  });

  it('should handle empty data', () => {
    const data = {
      columns: [],
      rows: [],
      rowCount: 0,
    };

    const table = formatAsTable(data);

    expect(table).toBe('No results');
  });

  it('should truncate long values', () => {
    const data = {
      columns: ['Name'],
      rows: [
        { Name: 'A'.repeat(100) },
      ],
      rowCount: 1,
    };

    const table = formatAsTable(data);

    expect(table).toContain('...');
    expect(table.length).toBeLessThan(200);
  });
});
