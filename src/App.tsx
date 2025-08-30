import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Table, Column, Relationship, Schema, BaseTable, ProjectFile, ProjectState } from './types';
import TableComponent from './components/TableComponent';
import Sidebar from './components/Sidebar';
import RelationshipLine from './components/RelationshipLine';

const App: React.FC = () => {
  const [schema, setSchema] = useState<Schema>({
    tables: [],
    relationships: [],
    baseTables: []
  });

  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [projectState, setProjectState] = useState<ProjectState>({
    currentFile: null,
    hasUnsavedChanges: false,
    isAutoSaveEnabled: true,
    lastSaved: null
  });
  
  const autoSaveTimeoutRef = useRef<number | null>(null);

  // Değişiklik işaretleme
  const markAsChanged = useCallback(() => {
    setProjectState(prev => ({ ...prev, hasUnsavedChanges: true }));
  }, []);

  // Proje kaydetme
  const saveProject = useCallback(async () => {
    if (!projectState.currentFile) {
      saveProjectAs();
      return;
    }

    try {
      const projectFile: ProjectFile = {
        name: projectState.currentFile.split('/').pop()?.replace('.dbschema', '') || 'Untitled',
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        schema,
        metadata: {
          description: 'Veritabanı şema dosyası',
          author: 'Database Schema Creator'
        }
      };

      const dataStr = JSON.stringify(projectFile, null, 2);
      
      localStorage.setItem(`dbschema_${projectState.currentFile}`, dataStr);
      
      setProjectState(prev => ({
        ...prev,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }));

      console.log('Proje kaydedildi:', projectState.currentFile);
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Dosya kaydedilirken hata oluştu!');
    }
  }, [schema, projectState.currentFile]);

  // Farklı kaydet
  const saveProjectAs = useCallback(async () => {
    try {
      const fileName = prompt('Proje dosyası adı:', 'yeni_proje');
      if (!fileName) return;

      const fullFileName = `${fileName}.dbschema`;
      
      const projectFile: ProjectFile = {
        name: fileName,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        schema,
        metadata: {
          description: 'Veritabanı şema dosyası',
          author: 'Database Schema Creator'
        }
      };

      const dataStr = JSON.stringify(projectFile, null, 2);
      
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', fullFileName);
      linkElement.click();

      localStorage.setItem(`dbschema_${fullFileName}`, dataStr);
      
      setProjectState(prev => ({
        ...prev,
        currentFile: fullFileName,
        hasUnsavedChanges: false,
        lastSaved: new Date().toISOString()
      }));

    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Dosya kaydedilirken hata oluştu!');
    }
  }, [schema]);

  // Otomatik kaydetme
  const scheduleAutoSave = useCallback(() => {
    if (!projectState.isAutoSaveEnabled || !projectState.currentFile) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      saveProject();
    }, 3000);
  }, [projectState.isAutoSaveEnabled, projectState.currentFile, saveProject]);

  // Otomatik kaydetme ve değişiklik işaretleme helper
  const updateSchemaAndMark = useCallback((updater: (prev: Schema) => Schema) => {
    setSchema(updater);
    markAsChanged();
    scheduleAutoSave();
  }, [markAsChanged, scheduleAutoSave]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        saveProject();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [saveProject]);

  // Yeni tablo oluştur
  const createTable = useCallback((name: string, baseTableId?: string) => {
    const baseTable = baseTableId 
      ? schema.baseTables.find(bt => bt.id === baseTableId)
      : null;

    const newTable: Table = {
      id: `table_${Date.now()}`,
      name,
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
      columns: baseTable ? baseTable.columns.map(col => ({
        ...col,
        id: `column_${Date.now()}_${Math.random()}`
      })) : []
    };

    updateSchemaAndMark(prev => ({
      ...prev,
      tables: [...prev.tables, newTable]
    }));
  }, [schema.baseTables, updateSchemaAndMark]);

  // Base table oluştur
  const createBaseTable = useCallback((name: string, description?: string) => {
    const newBaseTable: BaseTable = {
      id: `base_${Date.now()}`,
      name,
      description,
      columns: []
    };

    updateSchemaAndMark(prev => ({
      ...prev,
      baseTables: [...prev.baseTables, newBaseTable]
    }));
  }, [updateSchemaAndMark]);

  // Base table sil
  const deleteBaseTable = useCallback((baseTableId: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      baseTables: prev.baseTables.filter(bt => bt.id !== baseTableId)
    }));
  }, [updateSchemaAndMark]);

  // Base table'a kolon ekle
  const addColumnToBaseTable = useCallback((baseTableId: string, column: Omit<Column, 'id'>) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      baseTables: prev.baseTables.map(baseTable =>
        baseTable.id === baseTableId
          ? { ...baseTable, columns: [...baseTable.columns, column] }
          : baseTable
      )
    }));
  }, [updateSchemaAndMark]);

  // Base table'dan kolon sil
  const deleteColumnFromBaseTable = useCallback((baseTableId: string, columnIndex: number) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      baseTables: prev.baseTables.map(baseTable =>
        baseTable.id === baseTableId
          ? { 
              ...baseTable, 
              columns: baseTable.columns.filter((_, index) => index !== columnIndex) 
            }
          : baseTable
      )
    }));
  }, [updateSchemaAndMark]);

  // Tablo sil
  const deleteTable = useCallback((tableId: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.filter(t => t.id !== tableId),
      relationships: prev.relationships.filter(
        r => r.fromTableId !== tableId && r.toTableId !== tableId
      )
    }));
  }, [updateSchemaAndMark]);

  // Tablo pozisyonunu güncelle
  const updateTablePosition = useCallback((tableId: string, x: number, y: number) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId ? { ...table, x, y } : table
      )
    }));
  }, [updateSchemaAndMark]);

  // Kolon ekle
  const addColumn = useCallback((tableId: string, column: Omit<Column, 'id'>) => {
    const newColumn: Column = {
      id: `column_${Date.now()}`,
      ...column
    };

    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? { ...table, columns: [...table.columns, newColumn] }
          : table
      )
    }));
  }, [updateSchemaAndMark]);

  // Kolon sil
  const deleteColumn = useCallback((tableId: string, columnId: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? { ...table, columns: table.columns.filter(c => c.id !== columnId) }
          : table
      ),
      relationships: prev.relationships.filter(
        r => r.fromColumnId !== columnId && r.toColumnId !== columnId
      )
    }));
  }, [updateSchemaAndMark]);

  // Tablo adını güncelle
  const updateTableName = useCallback((tableId: string, newName: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId ? { ...table, name: newName } : table
      )
    }));
  }, [updateSchemaAndMark]);

  // Kolon adını güncelle
  const updateColumnName = useCallback((tableId: string, columnId: string, newName: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.map(column =>
                column.id === columnId ? { ...column, name: newName } : column
              )
            }
          : table
      )
    }));
  }, [updateSchemaAndMark]);

  // Kolon sırasını değiştir
  const reorderColumns = useCallback((tableId: string, fromIndex: number, toIndex: number) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      tables: prev.tables.map(table => {
        if (table.id !== tableId) return table;
        
        const newColumns = [...table.columns];
        const [movedColumn] = newColumns.splice(fromIndex, 1);
        newColumns.splice(toIndex, 0, movedColumn);
        
        return { ...table, columns: newColumns };
      })
    }));
  }, [updateSchemaAndMark]);

  // İlişki ekle
  const addRelationship = useCallback((relationship: Omit<Relationship, 'id'>) => {
    const newRelationship: Relationship = {
      id: `rel_${Date.now()}`,
      ...relationship
    };

    updateSchemaAndMark(prev => ({
      ...prev,
      relationships: [...prev.relationships, newRelationship]
    }));
  }, [updateSchemaAndMark]);

  const deleteRelationship = useCallback((relationshipId: string) => {
    updateSchemaAndMark(prev => ({
      ...prev,
      relationships: prev.relationships.filter(r => r.id !== relationshipId)
    }));
  }, [updateSchemaAndMark]);

  // Proje açma
  const openProject = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectFile: ProjectFile = JSON.parse(e.target?.result as string);
        
        if (projectFile.schema) {
          setSchema(projectFile.schema);
          setProjectState(prev => ({
            ...prev,
            currentFile: file.name,
            hasUnsavedChanges: false,
            lastSaved: projectFile.lastModified
          }));
        } else {
          throw new Error('Geçersiz proje dosyası formatı');
        }
      } catch (error) {
        console.error('Dosya açma hatası:', error);
        alert('Geçersiz proje dosyası!');
      }
    };
    reader.readAsText(file);
  }, []);

  // Yeni proje
  const newProject = useCallback(() => {
    if (projectState.hasUnsavedChanges) {
      const shouldSave = confirm('Kaydedilmemiş değişiklikler var. Devam etmek istiyor musunuz?');
      if (!shouldSave) return;
    }

    setSchema({
      tables: [],
      relationships: [],
      baseTables: []
    });
    
    setProjectState({
      currentFile: null,
      hasUnsavedChanges: false,
      isAutoSaveEnabled: true,
      lastSaved: null
    });
    
    setSelectedTable(null);
  }, [projectState.hasUnsavedChanges]);

  // Temiz DB Schema Export - sadece veritabanı şeması
  const exportSchema = useCallback(() => {
    // Sadece veritabanı şeması için gerekli veriler
    const cleanSchema = {
      tables: schema.tables.map(table => ({
        name: table.name,
        columns: table.columns.map(column => ({
          name: column.name,
          type: column.type,
          nullable: column.nullable,
          primaryKey: column.primaryKey,
          foreignKey: column.foreignKey
        }))
      })),
      relationships: schema.relationships.map(relationship => {
        const fromTable = schema.tables.find(t => t.id === relationship.fromTableId);
        const toTable = schema.tables.find(t => t.id === relationship.toTableId);
        const fromColumn = fromTable?.columns.find(c => c.id === relationship.fromColumnId);
        const toColumn = toTable?.columns.find(c => c.id === relationship.toColumnId);
        
        return {
          from: {
            table: fromTable?.name,
            column: fromColumn?.name
          },
          to: {
            table: toTable?.name,
            column: toColumn?.name
          },
          type: relationship.type
        };
      })
    };

    const dataStr = JSON.stringify(cleanSchema, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'database_schema.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [schema]);

  return (
    <div className="designer-container">
      <Sidebar
        schema={schema}
        selectedTable={selectedTable}
        projectState={projectState}
        onSelectTable={setSelectedTable}
        onCreateTable={createTable}
        onDeleteTable={deleteTable}
        onUpdateTableName={updateTableName}
        onAddColumn={addColumn}
        onDeleteColumn={deleteColumn}
        onUpdateColumnName={updateColumnName}
        onReorderColumns={reorderColumns}
        onAddRelationship={addRelationship}
        onDeleteRelationship={deleteRelationship}
        onCreateBaseTable={createBaseTable}
        onDeleteBaseTable={deleteBaseTable}
        onAddColumnToBaseTable={addColumnToBaseTable}
        onDeleteColumnFromBaseTable={deleteColumnFromBaseTable}
        onNewProject={newProject}
        onSaveProject={saveProject}
        onSaveProjectAs={saveProjectAs}
        onOpenProject={openProject}
        onExportSchema={exportSchema}
      />

      <div className="canvas-container">
        <div className="canvas">
          {/* Tablolar */}
          {schema.tables.map(table => (
            <TableComponent
              key={table.id}
              table={table}
              isSelected={selectedTable === table.id}
              onSelect={() => setSelectedTable(table.id)}
              onPositionChange={(x, y) => updateTablePosition(table.id, x, y)}
              onUpdateTableName={updateTableName}
            />
          ))}

          {/* İlişki çizgileri */}
          {schema.relationships.map(relationship => (
            <RelationshipLine
              key={relationship.id}
              relationship={relationship}
              tables={schema.tables}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App;
