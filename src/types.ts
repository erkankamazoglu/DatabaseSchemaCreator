export interface Column {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    tableId: string;
    columnId: string;
  };
}

export interface Table {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: Column[];
}

export interface Relationship {
  id: string;
  fromTableId: string;
  fromColumnId: string;
  toTableId: string;
  toColumnId: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
}

export interface BaseTable {
  id: string;
  name: string;
  columns: Omit<Column, 'id'>[];
  description?: string;
}

export interface Schema {
  tables: Table[];
  relationships: Relationship[];
  baseTables: BaseTable[];
}

export interface ProjectFile {
  name: string;
  version: string;
  createdAt: string;
  lastModified: string;
  schema: Schema;
  metadata?: {
    description?: string;
    author?: string;
    tags?: string[];
  };
}

export interface ProjectState {
  currentFile: string | null;
  hasUnsavedChanges: boolean;
  isAutoSaveEnabled: boolean;
  lastSaved: string | null;
}

export const COLUMN_TYPES = [
  'VARCHAR',
  'INT',
  'BIGINT',
  'DECIMAL',
  'FLOAT',
  'DOUBLE',
  'BOOLEAN',
  'DATE',
  'DATETIME',
  'TIMESTAMP',
  'TEXT',
  'BLOB'
];
