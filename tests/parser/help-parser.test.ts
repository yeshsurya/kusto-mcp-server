import { parseHelpOutput, getKnownOptions } from '../../src/parser/help-parser.js';

describe('parseHelpOutput', () => {
  it('should parse basic help output', () => {
    const helpText = `
Kusto.Cli version 1.0.0
A command-line interface for Kusto.

Usage: Kusto.Cli [connectionString] [options]

Options:
-execute:query     Execute a query
-script:path       Execute script file
-azcli             Use Azure CLI auth
-timeout:seconds   Query timeout
`;

    const result = parseHelpOutput(helpText);

    expect(result.version).toBe('1.0.0');
    expect(result.usage).toBe('Kusto.Cli [connectionString] [options]');
    expect(result.options.length).toBeGreaterThan(0);
  });

  it('should categorize options correctly', () => {
    const helpText = `
Options:
-azcli             Use Azure CLI authentication
-execute:query     Execute a query
-scripted          Machine-readable output
-unsafe            Allow unsafe operations
`;

    const result = parseHelpOutput(helpText);

    const azcli = result.options.find(o => o.name === 'azcli');
    const execute = result.options.find(o => o.name === 'execute');
    const scripted = result.options.find(o => o.name === 'scripted');
    const unsafe = result.options.find(o => o.name === 'unsafe');

    expect(azcli?.category).toBe('auth');
    expect(execute?.category).toBe('execution');
    expect(scripted?.category).toBe('output');
    expect(unsafe?.category).toBe('security');
  });

  it('should identify options with values', () => {
    const helpText = `
Options:
-execute:query     Execute a query
-azcli             Use Azure CLI auth
`;

    const result = parseHelpOutput(helpText);

    const execute = result.options.find(o => o.name === 'execute');
    const azcli = result.options.find(o => o.name === 'azcli');

    expect(execute?.hasValue).toBe(true);
    expect(execute?.valueName).toBe('query');
    expect(azcli?.hasValue).toBe(false);
  });
});

describe('getKnownOptions', () => {
  it('should return predefined options', () => {
    const options = getKnownOptions();

    expect(options.length).toBeGreaterThan(0);

    const execute = options.find(o => o.name === 'execute');
    expect(execute).toBeDefined();
    expect(execute?.hasValue).toBe(true);
    expect(execute?.category).toBe('execution');

    const azcli = options.find(o => o.name === 'azcli');
    expect(azcli).toBeDefined();
    expect(azcli?.hasValue).toBe(false);
    expect(azcli?.category).toBe('auth');
  });

  it('should include scripted and headless options', () => {
    const options = getKnownOptions();

    const scripted = options.find(o => o.name === 'scripted');
    const headless = options.find(o => o.name === 'headless');

    expect(scripted).toBeDefined();
    expect(scripted?.category).toBe('output');
    expect(headless).toBeDefined();
    expect(headless?.category).toBe('output');
  });
});
