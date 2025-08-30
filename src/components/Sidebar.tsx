import React, { useState } from 'react';
import { Schema, COLUMN_TYPES, Column, Relationship, ProjectState } from '../types';
import { Plus, Download, Trash2, Database, ChevronDown, Edit3, GripVertical, Save, FolderOpen, FileText, Circle, Table, Layout } from 'lucide-react';

interface SidebarProps {
  schema: Schema;
  selectedTable: string | null;
  projectState: ProjectState;
  onSelectTable: (tableId: string | null) => void;
  onCreateTable: (name: string, baseTableId?: string) => void;
  onDeleteTable: (tableId: string) => void;
  onUpdateTableName: (tableId: string, newName: string) => void;
  onAddColumn: (tableId: string, column: Omit<Column, 'id'>) => void;
  onDeleteColumn: (tableId: string, columnId: string) => void;
  onUpdateColumnName: (tableId: string, columnId: string, newName: string) => void;
  onReorderColumns: (tableId: string, fromIndex: number, toIndex: number) => void;
  onAddRelationship: (relationship: Omit<Relationship, 'id'>) => void;
  onDeleteRelationship: (relationshipId: string) => void;
  onCreateBaseTable: (name: string, description?: string) => void;
  onDeleteBaseTable: (baseTableId: string) => void;
  onAddColumnToBaseTable: (baseTableId: string, column: Omit<Column, 'id'>) => void;
  onDeleteColumnFromBaseTable: (baseTableId: string, columnIndex: number) => void;
  onNewProject: () => void;
  onSaveProject: () => void;
  onSaveProjectAs: () => void;
  onOpenProject: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onExportSchema: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  schema,
  selectedTable,
  projectState,
  onSelectTable,
  onCreateTable,
  onDeleteTable,
  onUpdateTableName,
  onAddColumn,
  onDeleteColumn,
  onUpdateColumnName,
  onReorderColumns,
  onAddRelationship,
  onDeleteRelationship,
  onCreateBaseTable,
  onDeleteBaseTable,
  onAddColumnToBaseTable,
  onDeleteColumnFromBaseTable,
  onNewProject,
  onSaveProject,
  onSaveProjectAs,
  onOpenProject,
  onExportSchema
}) => {
  const [newTableName, setNewTableName] = useState('');
  const [showColumnForm, setShowColumnForm] = useState(false);
  const [showRelationshipForm, setShowRelationshipForm] = useState(false);
  const [showExportSection, setShowExportSection] = useState(false);
  const [showTablesSection, setShowTablesSection] = useState(false);
  const [activeTab, setActiveTab] = useState<'tables' | 'baseTables'>('tables');
  const [selectedBaseTable, setSelectedBaseTable] = useState<string | null>(null);
  const [newBaseTableName, setNewBaseTableName] = useState('');
  const [newBaseTableDescription, setNewBaseTableDescription] = useState('');
  const [baseTableColumnForm, setBaseTableColumnForm] = useState({
    name: '',
    type: 'VARCHAR',
    nullable: true,
    primaryKey: false
  });
  const [showBaseTableColumnForm, setShowBaseTableColumnForm] = useState<string | null>(null);
  const [editingTableName, setEditingTableName] = useState<string | null>(null);
  const [editingTableValue, setEditingTableValue] = useState<string>('');
  const [editingColumnName, setEditingColumnName] = useState<string | null>(null);
  const [editingColumnValue, setEditingColumnValue] = useState<string>('');
  const [draggedColumn, setDraggedColumn] = useState<number | null>(null);
  const [columnForm, setColumnForm] = useState({
    name: '',
    type: 'VARCHAR',
    nullable: true,
    primaryKey: false
  });
  const [relationshipForm, setRelationshipForm] = useState({
    fromTableId: '',
    fromColumnId: '',
    toTableId: '',
    toColumnId: '',
    type: 'one-to-many' as const
  });

  const selectedTableData = selectedTable 
    ? schema.tables.find(t => t.id === selectedTable)
    : null;

  const handleCreateTable = () => {
    if (newTableName.trim()) {
      onCreateTable(newTableName.trim(), selectedBaseTable || undefined);
      setNewTableName('');
      setSelectedBaseTable(null);
    }
  };

  const handleCreateBaseTable = () => {
    if (newBaseTableName.trim()) {
      onCreateBaseTable(newBaseTableName.trim(), newBaseTableDescription.trim() || undefined);
      setNewBaseTableName('');
      setNewBaseTableDescription('');
    }
  };

  const handleAddColumnToBaseTable = () => {
    if (showBaseTableColumnForm && baseTableColumnForm.name.trim()) {
      onAddColumnToBaseTable(showBaseTableColumnForm, {
        name: baseTableColumnForm.name.trim(),
        type: baseTableColumnForm.type,
        nullable: baseTableColumnForm.nullable,
        primaryKey: baseTableColumnForm.primaryKey
      });
      setBaseTableColumnForm({
        name: '',
        type: 'VARCHAR',
        nullable: true,
        primaryKey: false
      });
      setShowBaseTableColumnForm(null);
    }
  };

  const handleAddColumn = () => {
    if (selectedTable && columnForm.name.trim()) {
      onAddColumn(selectedTable, {
        name: columnForm.name.trim(),
        type: columnForm.type,
        nullable: columnForm.nullable,
        primaryKey: columnForm.primaryKey
      });
      setColumnForm({
        name: '',
        type: 'VARCHAR',
        nullable: true,
        primaryKey: false
      });
      setShowColumnForm(false);
    }
  };

  const handleAddRelationship = () => {
    if (relationshipForm.fromTableId && relationshipForm.fromColumnId &&
        relationshipForm.toTableId && relationshipForm.toColumnId) {
      onAddRelationship(relationshipForm);
      setRelationshipForm({
        fromTableId: '',
        fromColumnId: '',
        toTableId: '',
        toColumnId: '',
        type: 'one-to-many'
      });
      setShowRelationshipForm(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedColumn(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedColumn !== null && selectedTable && draggedColumn !== dropIndex) {
      onReorderColumns(selectedTable, draggedColumn, dropIndex);
    }
    setDraggedColumn(null);
  };

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={24} />
          Şema Tasarım Aracı
        </h1>
        
        {/* Proje Bilgileri */}
        <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '6px', marginBottom: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FileText size={14} />
              <span style={{ fontSize: '13px', fontWeight: '500' }}>
                {projectState.currentFile || 'Kaydedilmemiş Proje'}
              </span>
              {projectState.hasUnsavedChanges && (
                <Circle size={8} style={{ color: '#ef4444', fill: '#ef4444' }} />
              )}
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {projectState.lastSaved 
              ? `Son kayıt: ${new Date(projectState.lastSaved).toLocaleTimeString()}`
              : 'Henüz kaydedilmedi'
            }
          </div>
        </div>

        {/* Proje İşlemleri */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
          <button 
            className="btn"
            style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
            onClick={onNewProject}
            title="Yeni Proje"
          >
            <FileText size={12} />
          </button>
          <label 
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '4px 8px', flex: 1, cursor: 'pointer', textAlign: 'center' }}
            title="Proje Aç"
          >
            <FolderOpen size={12} />
            <input
              type="file"
              accept=".dbschema"
              onChange={onOpenProject}
              style={{ display: 'none' }}
            />
          </label>
          <button 
            className="btn"
            style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
            onClick={onSaveProject}
            title="Kaydet (Ctrl+S)"
          >
            <Save size={12} />
          </button>
          <button 
            className="btn btn-secondary"
            style={{ fontSize: '11px', padding: '4px 8px', flex: 1 }}
            onClick={onSaveProjectAs}
            title="Farklı Kaydet"
          >
            <Download size={12} />
          </button>
        </div>

        <p style={{ fontSize: '12px', color: '#6b7280' }}>
          {projectState.isAutoSaveEnabled && projectState.currentFile && 'Otomatik kayıt açık'}
        </p>
      </div>

      {/* Yeni Tablo Oluştur */}
      <div className="form-group">
        <label className="form-label">Yeni Tablo</label>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tablo adı"
            value={newTableName}
            onChange={(e) => setNewTableName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateTable()}
          />
          <button className="btn" onClick={handleCreateTable}>
            <Plus size={16} />
          </button>
        </div>
        {schema.baseTables.length > 0 && (
          <select
            className="form-select"
            value={selectedBaseTable || ''}
            onChange={(e) => setSelectedBaseTable(e.target.value || null)}
          >
            <option value="">Base tablo seçin (opsiyonel)</option>
            {schema.baseTables.map(baseTable => (
              <option key={baseTable.id} value={baseTable.id}>
                {baseTable.name} ({baseTable.columns.length} kolon)
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Tablolar ve Base Tablolar - Sekmeli Arayüz */}
      <div className="form-group">
        <div
          className="collapsible-header"
          onClick={() => setShowTablesSection(!showTablesSection)}
        >
          <span className="form-label" style={{ margin: 0 }}>
            Tablo Yönetimi ({schema.tables.length + schema.baseTables.length})
          </span>
          <ChevronDown 
            size={16} 
            className={`chevron ${showTablesSection ? 'expanded' : ''}`}
          />
        </div>

        {showTablesSection && (
          <div className="tab-container">
            {/* Tab Headers */}
            <div className="tab-header">
              <button
                className={`tab-button ${activeTab === 'tables' ? 'active' : ''}`}
                onClick={() => setActiveTab('tables')}
              >
                <Table size={14} />
                Tablolar ({schema.tables.length})
              </button>
              <button
                className={`tab-button ${activeTab === 'baseTables' ? 'active' : ''}`}
                onClick={() => setActiveTab('baseTables')}
              >
                <Layout size={14} />
                Base Tablolar ({schema.baseTables.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="tab-content">
              {activeTab === 'tables' ? (
                /* Normal Tablolar Tab */
                <div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                    {schema.tables.map(table => (
                      <div
                        key={table.id}
                        style={{
                          padding: '8px 12px',
                          margin: '4px 0',
                          background: selectedTable === table.id ? '#eff6ff' : '#f8fafc',
                          border: selectedTable === table.id ? '1px solid #3b82f6' : '1px solid #e2e8f0',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                        onClick={() => onSelectTable(table.id)}
                      >
                        <input
                          type="text"
                          className="editable-input"
                          value={editingTableName === table.id ? editingTableValue : table.name}
                          onChange={(e) => setEditingTableValue(e.target.value)}
                          onBlur={() => {
                            if (editingTableName === table.id && editingTableValue && editingTableValue !== table.name) {
                              onUpdateTableName(table.id, editingTableValue);
                            }
                            setEditingTableName(null);
                            setEditingTableValue('');
                          }}
                          onFocus={(e) => {
                            e.stopPropagation();
                            setEditingTableName(table.id);
                            setEditingTableValue(table.name);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            flex: 1,
                            marginRight: '8px'
                          }}
                        />
                        <button
                          className="btn-danger"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteTable(table.id);
                            if (selectedTable === table.id) {
                              onSelectTable(null);
                            }
                          }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Base Tablolar Tab */
                <div>
                  {/* Yeni Base Tablo Oluştur */}
                  <div 
                    style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #bbf7d0' }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Base tablo adı"
                        value={newBaseTableName}
                        onChange={(e) => setNewBaseTableName(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleCreateBaseTable()}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Açıklama (opsiyonel)"
                        value={newBaseTableDescription}
                        onChange={(e) => setNewBaseTableDescription(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      />
                    </div>
                    <button 
                      className="btn" 
                      onClick={handleCreateBaseTable} 
                      style={{ width: '100%' }}
                    >
                      <Plus size={16} style={{ marginRight: '6px' }} />
                      Base Tablo Oluştur
                    </button>
                  </div>

                  {/* Base Tablo Listesi */}
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {schema.baseTables.map(baseTable => (
                      <div
                        key={baseTable.id}
                        style={{
                          padding: '8px 12px',
                          margin: '4px 0',
                          background: selectedBaseTable === baseTable.id ? '#ecfdf5' : '#f9fafb',
                          border: selectedBaseTable === baseTable.id ? '1px solid #10b981' : '1px solid #e5e7eb',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                        onClick={() => {
                          if (selectedBaseTable === baseTable.id) {
                            setSelectedBaseTable(null);
                            setShowBaseTableColumnForm(null);
                          } else {
                            setSelectedBaseTable(baseTable.id);
                            setShowBaseTableColumnForm(null);
                          }
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>{baseTable.name}</div>
                            {baseTable.description && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>{baseTable.description}</div>
                            )}
                            <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                              {baseTable.columns.length} kolon
                            </div>
                          </div>
                          <button
                            className="btn-danger"
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteBaseTable(baseTable.id);
                              if (selectedBaseTable === baseTable.id) {
                                setSelectedBaseTable(null);
                                setShowBaseTableColumnForm(null);
                              }
                            }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>

                        {/* Base Tablo Detayları */}
                        {selectedBaseTable === baseTable.id && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e5e7eb' }}>
                            {/* Kolon Ekleme Formu */}
                            {showBaseTableColumnForm !== baseTable.id ? (
                              <button
                                className="btn"
                                style={{ padding: '4px 8px', fontSize: '12px', marginBottom: '8px' }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowBaseTableColumnForm(baseTable.id);
                                }}
                              >
                                <Plus size={12} style={{ marginRight: '4px' }} />
                                Kolon Ekle
                              </button>
                            ) : (
                              <div 
                                style={{ background: '#f8fafc', padding: '8px', borderRadius: '4px', marginBottom: '8px' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="form-group" style={{ marginBottom: '6px' }}>
                                  <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Kolon adı"
                                    value={baseTableColumnForm.name}
                                    onChange={(e) => setBaseTableColumnForm(prev => ({ ...prev, name: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  />
                                </div>
                                <div className="form-group" style={{ marginBottom: '6px' }}>
                                  <select
                                    className="form-select"
                                    value={baseTableColumnForm.type}
                                    onChange={(e) => setBaseTableColumnForm(prev => ({ ...prev, type: e.target.value }))}
                                    onClick={(e) => e.stopPropagation()}
                                    onFocus={(e) => e.stopPropagation()}
                                  >
                                    {COLUMN_TYPES.map(type => (
                                      <option key={type} value={type}>{type}</option>
                                    ))}
                                  </select>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                                    <input
                                      type="checkbox"
                                      className="form-checkbox"
                                      checked={baseTableColumnForm.primaryKey}
                                      onChange={(e) => setBaseTableColumnForm(prev => ({ ...prev, primaryKey: e.target.checked }))}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    Primary Key
                                  </label>
                                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '11px' }}>
                                    <input
                                      type="checkbox"
                                      className="form-checkbox"
                                      checked={baseTableColumnForm.nullable}
                                      onChange={(e) => setBaseTableColumnForm(prev => ({ ...prev, nullable: e.target.checked }))}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                    Nullable
                                  </label>
                                </div>
                                <div style={{ display: 'flex', gap: '4px' }}>
                                  <button 
                                    className="btn" 
                                    style={{ fontSize: '11px', padding: '2px 6px' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleAddColumnToBaseTable();
                                    }}
                                  >
                                    Ekle
                                  </button>
                                  <button 
                                    className="btn-secondary" 
                                    style={{ fontSize: '11px', padding: '2px 6px' }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowBaseTableColumnForm(null);
                                      setBaseTableColumnForm({
                                        name: '',
                                        type: 'VARCHAR',
                                        nullable: true,
                                        primaryKey: false
                                      });
                                    }}
                                  >
                                    İptal
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* Kolonlar Listesi */}
                            {baseTable.columns.length > 0 && (
                              <div>
                                <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>Kolonlar:</div>
                                {baseTable.columns.map((column, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      padding: '4px 6px',
                                      margin: '2px 0',
                                      background: 'white',
                                      border: '1px solid #e5e7eb',
                                      borderRadius: '3px',
                                      fontSize: '11px',
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center'
                                    }}
                                  >
                                    <div>
                                      <span style={{ fontWeight: '500' }}>{column.name}</span>
                                      <span style={{ color: '#6b7280', marginLeft: '6px' }}>{column.type}</span>
                                      {column.primaryKey && <span style={{ color: '#f59e0b', marginLeft: '4px' }}>PK</span>}
                                    </div>
                                    <button
                                      className="btn-danger"
                                      style={{ padding: '2px 4px', fontSize: '9px' }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteColumnFromBaseTable(baseTable.id, index);
                                      }}
                                    >
                                      <Trash2 size={8} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Seçili Tablo Detayları */}
      {selectedTableData && (
        <div className="selected-table-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <input
              type="text"
              className="editable-input"
              value={editingTableName === selectedTableData.id ? editingTableValue : selectedTableData.name}
              onChange={(e) => setEditingTableValue(e.target.value)}
              onBlur={() => {
                if (editingTableName === selectedTableData.id && editingTableValue && editingTableValue !== selectedTableData.name) {
                  onUpdateTableName(selectedTableData.id, editingTableValue);
                }
                setEditingTableName(null);
                setEditingTableValue('');
              }}
              onFocus={() => {
                setEditingTableName(selectedTableData.id);
                setEditingTableValue(selectedTableData.name);
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
              }}
              style={{ 
                fontSize: '16px', 
                fontWeight: '600', 
                color: '#1f2937',
                maxWidth: '200px'
              }}
            />
            <Edit3 size={14} style={{ color: '#6b7280' }} />
          </div>
          
          {/* Kolonlar */}
          <div style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: '500' }}>Kolonlar ({selectedTableData.columns.length})</span>
              <button
                className="btn"
                style={{ padding: '4px 8px', fontSize: '12px' }}
                onClick={() => setShowColumnForm(!showColumnForm)}
              >
                <Plus size={12} />
              </button>
            </div>

            {showColumnForm && (
              <div 
                style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '8px' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Kolon adı"
                    value={columnForm.name}
                    onChange={(e) => setColumnForm(prev => ({ ...prev, name: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: '8px' }}>
                  <select
                    className="form-select"
                    value={columnForm.type}
                    onChange={(e) => setColumnForm(prev => ({ ...prev, type: e.target.value }))}
                    onClick={(e) => e.stopPropagation()}
                    onFocus={(e) => e.stopPropagation()}
                  >
                    {COLUMN_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={columnForm.primaryKey}
                      onChange={(e) => setColumnForm(prev => ({ ...prev, primaryKey: e.target.checked }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    Primary Key
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', fontSize: '13px' }}>
                    <input
                      type="checkbox"
                      className="form-checkbox"
                      checked={columnForm.nullable}
                      onChange={(e) => setColumnForm(prev => ({ ...prev, nullable: e.target.checked }))}
                      onClick={(e) => e.stopPropagation()}
                    />
                    Nullable
                  </label>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="btn" onClick={handleAddColumn}>Ekle</button>
                  <button className="btn-secondary" onClick={() => setShowColumnForm(false)}>İptal</button>
                </div>
              </div>
            )}

            <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
              {selectedTableData.columns.map((column, index) => (
                <div
                  key={column.id}
                  className={`column-item ${draggedColumn === index ? 'dragging' : ''}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                    <GripVertical size={12} style={{ color: '#9ca3af', marginRight: '6px', cursor: 'grab' }} />
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        className="editable-input"
                        value={editingColumnName === column.id ? editingColumnValue : column.name}
                        onChange={(e) => setEditingColumnValue(e.target.value)}
                        onBlur={() => {
                          if (editingColumnName === column.id && editingColumnValue && editingColumnValue !== column.name) {
                            onUpdateColumnName(selectedTableData.id, column.id, editingColumnValue);
                          }
                          setEditingColumnName(null);
                          setEditingColumnValue('');
                        }}
                        onFocus={() => {
                          setEditingColumnName(column.id);
                          setEditingColumnValue(column.name);
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.currentTarget.blur();
                          }
                        }}
                        style={{ 
                          fontWeight: '500',
                          fontSize: '12px',
                          marginBottom: '2px'
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ color: '#6b7280', fontSize: '11px' }}>{column.type}</span>
                        {column.primaryKey && <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: '500' }}>PK</span>}
                        {column.foreignKey && <span style={{ color: '#3b82f6', fontSize: '10px', fontWeight: '500' }}>FK</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    className="btn-danger"
                    style={{ padding: '2px 6px', fontSize: '10px' }}
                    onClick={() => onDeleteColumn(selectedTableData.id, column.id)}
                  >
                    <Trash2 size={10} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* İlişkiler - Seçili Tabloya Özel */}
          {schema.tables.length >= 2 && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', fontWeight: '500' }}>
                  İlişkiler ({schema.relationships.filter(r => 
                    r.fromTableId === selectedTableData.id || r.toTableId === selectedTableData.id
                  ).length})
                </span>
                <button
                  className="btn"
                  style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#10b981', borderColor: '#10b981' }}
                  onClick={() => {
                    // Seçili tabloyu otomatik kaynak tablo yap
                    setRelationshipForm(prev => ({ 
                      ...prev, 
                      fromTableId: selectedTableData.id,
                      fromColumnId: '',
                      toTableId: '',
                      toColumnId: '',
                      type: 'one-to-many'
                    }));
                    setShowRelationshipForm(true);
                  }}
                  title="İlişki Ekle"
                >
                  🔗
                </button>
              </div>

              {/* Tablonun İlişkilerini Listele */}
              {schema.relationships
                .filter(r => r.fromTableId === selectedTableData.id || r.toTableId === selectedTableData.id)
                .map(relationship => {
                  const fromTable = schema.tables.find(t => t.id === relationship.fromTableId);
                  const toTable = schema.tables.find(t => t.id === relationship.toTableId);
                  const fromColumn = fromTable?.columns.find(c => c.id === relationship.fromColumnId);
                  const toColumn = toTable?.columns.find(c => c.id === relationship.toColumnId);
                  
                  return (
                    <div
                      key={relationship.id}
                      style={{
                        padding: '6px 8px',
                        margin: '4px 0',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '11px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500' }}>
                          {relationship.fromTableId === selectedTableData.id ? (
                            <span>
                              <span style={{ color: '#10b981' }}>{fromTable?.name}</span>.{fromColumn?.name} → {toTable?.name}.{toColumn?.name}
                            </span>
                          ) : (
                            <span>
                              {fromTable?.name}.{fromColumn?.name} → <span style={{ color: '#10b981' }}>{toTable?.name}</span>.{toColumn?.name}
                            </span>
                          )}
                        </div>
                        <div style={{ color: '#6b7280', fontSize: '10px' }}>
                          {relationship.type === 'one-to-one' ? '1:1' :
                           relationship.type === 'one-to-many' ? '1:N' : 'N:M'}
                        </div>
                      </div>
                      <button
                        className="btn-danger"
                        style={{ padding: '2px 4px', fontSize: '9px' }}
                        onClick={() => {
                          onDeleteRelationship(relationship.id);
                        }}
                      >
                        <Trash2 size={8} />
                      </button>
                    </div>
                  );
                })}

              {/* Seçili Tabloya Özel İlişki Ekleme Formu */}
              {showRelationshipForm && relationshipForm.fromTableId === selectedTableData.id && (
                <div 
                  style={{ background: '#f0fdf4', padding: '12px', borderRadius: '6px', marginTop: '8px', border: '1px solid #bbf7d0' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div style={{ marginBottom: '8px', fontSize: '12px', fontWeight: '500', color: '#065f46' }}>
                    Kaynak: {selectedTableData.name}
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Kaynak Kolon</label>
                    <select
                      className="form-select"
                      value={relationshipForm.fromColumnId}
                      onChange={(e) => setRelationshipForm(prev => ({ ...prev, fromColumnId: e.target.value }))}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <option value="">Kolon seçin</option>
                      {selectedTableData.columns.map(column => (
                        <option key={column.id} value={column.id}>{column.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>Hedef Tablo</label>
                    <select
                      className="form-select"
                      value={relationshipForm.toTableId}
                      onChange={(e) => setRelationshipForm(prev => ({ ...prev, toTableId: e.target.value, toColumnId: '' }))}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <option value="">Tablo seçin</option>
                      {schema.tables
                        .filter(t => t.id !== selectedTableData.id)
                        .map(table => (
                          <option key={table.id} value={table.id}>{table.name}</option>
                        ))}
                    </select>
                  </div>

                  {relationshipForm.toTableId && (
                    <div className="form-group" style={{ marginBottom: '8px' }}>
                      <label className="form-label" style={{ fontSize: '12px' }}>Hedef Kolon</label>
                      <select
                        className="form-select"
                        value={relationshipForm.toColumnId}
                        onChange={(e) => setRelationshipForm(prev => ({ ...prev, toColumnId: e.target.value }))}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => e.stopPropagation()}
                      >
                        <option value="">Kolon seçin</option>
                        {schema.tables
                          .find(t => t.id === relationshipForm.toTableId)
                          ?.columns.map(column => (
                            <option key={column.id} value={column.id}>{column.name}</option>
                          ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group" style={{ marginBottom: '8px' }}>
                    <label className="form-label" style={{ fontSize: '12px' }}>İlişki Tipi</label>
                    <select
                      className="form-select"
                      value={relationshipForm.type}
                      onChange={(e) => setRelationshipForm(prev => ({ ...prev, type: e.target.value as any }))}
                      onClick={(e) => e.stopPropagation()}
                      onFocus={(e) => e.stopPropagation()}
                    >
                      <option value="one-to-one">Bir-e-Bir (1:1)</option>
                      <option value="one-to-many">Bir-e-Çok (1:N)</option>
                      <option value="many-to-many">Çok-a-Çok (N:M)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      className="btn" 
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={handleAddRelationship}
                    >
                      Ekle
                    </button>
                    <button 
                      className="btn-secondary" 
                      style={{ fontSize: '11px', padding: '4px 8px' }}
                      onClick={() => setShowRelationshipForm(false)}
                    >
                      İptal
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}   

      {/* Export/Import */}
      <div className="export-section">
        <div
          className="collapsible-header"
          onClick={() => setShowExportSection(!showExportSection)}
        >
          <span className="form-label" style={{ margin: 0 }}>Export İşlemleri</span>
          <ChevronDown 
            size={16} 
            className={`chevron ${showExportSection ? 'expanded' : ''}`}
          />
        </div>

        {showExportSection && (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
                              <button className="btn" onClick={onExportSchema}>
                  <Download size={16} style={{ marginRight: '8px' }} />
                  Temiz DB Şema Export
                </button>
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
                Not: Proje kaydetme yukarıdaki butonlardan yapılır
              </div>
            </div>

            {schema.tables.length > 0 && (
              <div>
                <label className="form-label" style={{ fontSize: '12px', marginBottom: '8px' }}>
                  Şema Önizleme:
                </label>
                <div className="json-output">
                  {JSON.stringify(schema, null, 2)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
