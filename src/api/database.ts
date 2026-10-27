import { get, del } from '../utils/http';

/** 資料表（Kind：r 資料表、p 分割表、m 實體化檢視表、f 外部表） */
export interface TableInfo {
    Name: string
    Kind: string
    SizeBytes: number
    RowEstimate: number
    ReadCount: number
    WriteCount: number
    LastRead: string | null
    LastWrite: string | null
    /** 目前持有此資料表鎖定（正在讀寫）的連線數 */
    LockSessions: number
    LockModes: string | null
}

export interface SchemaInfo {
    Name: string
    Owner: string
    /** 本系統設定的場域（appsettings Channels），系統持續讀取中 */
    IsSystemSchema: boolean
    /** 不可刪除的原因，null 表示可以刪除 */
    ProtectedReason: string | null
    TableCount: number
    SizeBytes: number
    LastRead: string | null
    LastWrite: string | null
    TablesInUse: number
    Tables: TableInfo[]
}

export interface DatabaseInfo {
    Name: string
    Owner: string
    SizeBytes: number | null
    /** 本系統正在使用的資料庫 */
    IsSystemDatabase: boolean
    ProtectedReason: string | null
    Connections: number
    ActiveConnections: number
    LastActivity: string | null
    Applications: string[]
    Clients: string[]
    LastRead: string | null
    LastWrite: string | null
    /** 無法讀取資料庫內容時的原因 */
    Error: string | null
    Schemas: SchemaInfo[]
}

export interface DatabaseOverview {
    ServerVersion: string
    SystemDatabase: string
    /** PostgreSQL 16 以上才有最後讀取時間 */
    HasReadTime: boolean
    /** 有權限讀資料檔修改時間；沒有時最後修改時間是用 autovacuum / analyze 估算 */
    HasFileTime: boolean
    /** 伺服器產生資料的時間（UTC） */
    GeneratedAt: string
    Databases: DatabaseInfo[]
}

/** 整台 PostgreSQL 的資料庫、schema、資料表與目前存取狀況 */
export function getDatabaseOverview(): Promise<DatabaseOverview> {
    return get('/api/Database/Overview', undefined, { timeout: 60000 }) as unknown as Promise<DatabaseOverview>;
}

/** 刪除整個資料庫；force 會中斷該資料庫目前的其他連線 */
export function dropDatabase(name: string, force: boolean): Promise<any> {
    return del('/api/Database/DropDatabase', { params: { name, force }, timeout: 60000 });
}

/** 刪除 schema（CASCADE，連同裡面所有資料表） */
export function dropSchema(database: string, schema: string): Promise<any> {
    return del('/api/Database/DropSchema', { params: { database, schema }, timeout: 60000 });
}
