import React, { useState, useRef } from 'react';
import Draggable from 'react-draggable';
import { Table } from '../types';
import { Key, Link } from 'lucide-react';

interface TableComponentProps {
  table: Table;
  isSelected: boolean;
  onSelect: () => void;
  onPositionChange: (x: number, y: number) => void;
  onUpdateTableName?: (tableId: string, newName: string) => void;
}

const TableComponent: React.FC<TableComponentProps> = ({
  table,
  isSelected,
  onSelect,
  onPositionChange,
  onUpdateTableName
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editingValue, setEditingValue] = useState('');
  const nodeRef = useRef(null);
  return (
    <Draggable
      nodeRef={nodeRef}
      position={{ x: table.x, y: table.y }}
      onStop={(_, data) => onPositionChange(data.x, data.y)}
      handle=".table-header"
    >
      <div
        ref={nodeRef}
        className={`table ${isSelected ? 'selected' : ''}`}
        data-table-id={table.id}
        onClick={onSelect}
        style={{
          border: isSelected ? '2px solid #3b82f6' : '2px solid #e2e8f0'
        }}
      >
        <div className="table-header">
          {isEditingName ? (
            <input
              type="text"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={() => {
                if (editingValue && editingValue !== table.name && onUpdateTableName) {
                  onUpdateTableName(table.id, editingValue);
                }
                setIsEditingName(false);
                setEditingValue('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.currentTarget.blur();
                }
                if (e.key === 'Escape') {
                  setIsEditingName(false);
                  setEditingValue('');
                }
              }}
              autoFocus
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '2px 6px',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                outline: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span 
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (onUpdateTableName) {
                  setIsEditingName(true);
                  setEditingValue(table.name);
                }
              }}
              style={{ cursor: onUpdateTableName ? 'pointer' : 'default' }}
            >
              {table.name}
            </span>
          )}
          <span style={{ fontSize: '12px', opacity: 0.8 }}>
            {table.columns.length} kolon
          </span>
        </div>
        
        <div className="table-body">
          {table.columns.length === 0 ? (
            <div style={{ padding: '16px', color: '#6b7280', fontSize: '13px', textAlign: 'center' }}>
              Henüz kolon eklenmemiş
            </div>
          ) : (
            table.columns.map(column => (
              <div key={column.id} className="column">
                <div className="column-icon">
                  {column.primaryKey && <Key className="primary-key" size={12} />}
                  {column.foreignKey && <Link className="foreign-key" size={12} />}
                </div>
                <span className="column-name">{column.name}</span>
                <span className="column-type">{column.type}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default TableComponent;
