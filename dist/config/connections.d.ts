export type AuthMethod = 'azcli' | 'managedIdentity' | 'default';
export interface KustoConnection {
    name: string;
    cluster: string;
    database: string;
    authMethod: AuthMethod;
    managedIdentityId?: string;
    isDefault?: boolean;
}
export interface ConnectionsConfig {
    connections: KustoConnection[];
    defaultConnection?: string;
}
export declare function addConnection(connection: KustoConnection): void;
export declare function removeConnection(name: string): boolean;
export declare function getConnection(name: string): KustoConnection | undefined;
export declare function getDefaultConnection(): KustoConnection | undefined;
export declare function listConnections(): KustoConnection[];
export declare function setDefaultConnection(name: string): boolean;
export declare function buildConnectionString(connection: KustoConnection): string;
export declare function getAuthFlags(connection: KustoConnection): string[];
//# sourceMappingURL=connections.d.ts.map