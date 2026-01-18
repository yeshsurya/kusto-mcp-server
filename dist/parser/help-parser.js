const AUTH_KEYWORDS = ['auth', 'identity', 'azcli', 'fed', 'token', 'credential'];
const EXECUTION_KEYWORDS = ['execute', 'script', 'timeout', 'quit', 'line'];
const OUTPUT_KEYWORDS = ['output', 'format', 'csv', 'json', 'result', 'progress', 'headless'];
const SECURITY_KEYWORDS = ['unsafe', 'security', 'sandbox'];
function categorizeOption(name, description) {
    const searchText = `${name} ${description}`.toLowerCase();
    if (AUTH_KEYWORDS.some(kw => searchText.includes(kw))) {
        return 'auth';
    }
    if (EXECUTION_KEYWORDS.some(kw => searchText.includes(kw))) {
        return 'execution';
    }
    if (OUTPUT_KEYWORDS.some(kw => searchText.includes(kw))) {
        return 'output';
    }
    if (SECURITY_KEYWORDS.some(kw => searchText.includes(kw))) {
        return 'security';
    }
    return 'other';
}
function parseValueType(valueName) {
    const lower = valueName.toLowerCase();
    if (lower.includes('path') || lower.includes('file') || lower.includes('dir')) {
        return 'path';
    }
    if (lower.includes('count') || lower.includes('num') || lower.includes('timeout') || lower.includes('seconds')) {
        return 'number';
    }
    if (lower === 'true' || lower === 'false' || lower.includes('bool')) {
        return 'boolean';
    }
    return 'string';
}
export function parseHelpOutput(helpText) {
    const lines = helpText.split('\n');
    const options = [];
    const examples = [];
    let description = '';
    let usage = '';
    let version;
    let inOptions = false;
    let inExamples = false;
    let currentOption = null;
    for (const line of lines) {
        const trimmed = line.trim();
        // Parse version
        const versionMatch = trimmed.match(/version\s+(\d+\.\d+\.\d+)/i);
        if (versionMatch) {
            version = versionMatch[1];
            continue;
        }
        // Parse usage
        if (trimmed.toLowerCase().startsWith('usage:')) {
            usage = trimmed.substring(6).trim();
            continue;
        }
        // Detect sections
        if (trimmed.toLowerCase() === 'options:' || trimmed.toLowerCase().includes('command line options')) {
            inOptions = true;
            inExamples = false;
            continue;
        }
        if (trimmed.toLowerCase() === 'examples:') {
            inOptions = false;
            inExamples = true;
            if (currentOption?.name) {
                options.push(currentOption);
                currentOption = null;
            }
            continue;
        }
        // Parse options
        if (inOptions) {
            // Option line: starts with - or /
            const optionMatch = trimmed.match(/^[-\/](\w+)(?::(\w+))?(?:\s+(.*))?$/);
            if (optionMatch) {
                if (currentOption?.name) {
                    options.push(currentOption);
                }
                const name = optionMatch[1];
                const valueName = optionMatch[2];
                const desc = optionMatch[3] || '';
                currentOption = {
                    name,
                    description: desc,
                    hasValue: !!valueName,
                    valueName,
                    valueType: valueName ? parseValueType(valueName) : undefined,
                    category: categorizeOption(name, desc),
                };
            }
            else if (currentOption && trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('/')) {
                // Continuation of previous option description
                currentOption.description = `${currentOption.description} ${trimmed}`.trim();
            }
        }
        // Parse examples
        if (inExamples && trimmed) {
            examples.push(trimmed);
        }
        // Build description from early lines
        if (!inOptions && !inExamples && !version && !usage && trimmed && !trimmed.startsWith('-')) {
            if (description) {
                description += ' ' + trimmed;
            }
            else {
                description = trimmed;
            }
        }
    }
    // Add last option if pending
    if (currentOption?.name) {
        options.push(currentOption);
    }
    return {
        version,
        description: description.trim(),
        usage,
        options,
        examples,
    };
}
export function getKnownOptions() {
    // Hardcoded known options for the Kusto CLI
    return [
        {
            name: 'execute',
            shortForm: 'e',
            description: 'Execute a query or command',
            hasValue: true,
            valueType: 'string',
            valueName: 'query',
            category: 'execution',
        },
        {
            name: 'script',
            description: 'Execute commands from a script file',
            hasValue: true,
            valueType: 'path',
            valueName: 'path',
            category: 'execution',
        },
        {
            name: 'scripted',
            description: 'Run in scripted mode (machine-readable output)',
            hasValue: false,
            category: 'output',
        },
        {
            name: 'headless',
            description: 'Run without header output',
            hasValue: false,
            category: 'output',
        },
        {
            name: 'noProgress',
            description: 'Suppress progress messages',
            hasValue: false,
            category: 'output',
        },
        {
            name: 'azcli',
            description: 'Use Azure CLI authentication',
            hasValue: false,
            category: 'auth',
        },
        {
            name: 'managedIdentity',
            description: 'Use Managed Identity authentication',
            hasValue: true,
            valueType: 'string',
            valueName: 'clientId',
            category: 'auth',
        },
        {
            name: 'timeout',
            shortForm: 't',
            description: 'Query execution timeout in seconds',
            hasValue: true,
            valueType: 'number',
            valueName: 'seconds',
            defaultValue: '60',
            category: 'execution',
        },
        {
            name: 'quitOnError',
            description: 'Exit on first error when executing script',
            hasValue: false,
            category: 'execution',
        },
        {
            name: 'multiLine',
            description: 'Enable multi-line mode for script execution',
            hasValue: false,
            category: 'execution',
        },
        {
            name: 'lineMode',
            description: 'Set line processing mode',
            hasValue: true,
            valueType: 'string',
            valueName: 'mode',
            category: 'execution',
        },
        {
            name: 'csvQuote',
            description: 'Use double-quoted CSV format',
            hasValue: false,
            category: 'output',
        },
        {
            name: 'unsafe',
            description: 'Allow potentially unsafe operations',
            hasValue: false,
            category: 'security',
        },
    ];
}
//# sourceMappingURL=help-parser.js.map