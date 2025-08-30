import React, { useState, useEffect } from 'react';
import { Relationship, Table } from '../types';

interface RelationshipLineProps {
  relationship: Relationship;
  tables: Table[];
}

const RelationshipLine: React.FC<RelationshipLineProps> = ({
  relationship,
  tables
}) => {
  const [dimensions, setDimensions] = useState({
    tableHeaderHeight: 36,
    columnHeight: 32
  });

  const fromTable = tables.find(t => t.id === relationship.fromTableId);
  const toTable = tables.find(t => t.id === relationship.toTableId);

  if (!fromTable || !toTable) return null;

  // Kaynak ve hedef kolonları bul
  const fromColumn = fromTable.columns.find(c => c.id === relationship.fromColumnId);
  const toColumn = toTable.columns.find(c => c.id === relationship.toColumnId);

  if (!fromColumn || !toColumn) return null;

  // Kolon pozisyonlarını hesapla
  const fromColumnIndex = fromTable.columns.findIndex(c => c.id === relationship.fromColumnId);
  const toColumnIndex = toTable.columns.findIndex(c => c.id === relationship.toColumnId);



  // DOM elementleri render edildikten sonra ölçüm yap
  useEffect(() => {
    const measureDimensions = () => {
      const fromTableElement = document.querySelector(`[data-table-id="${fromTable.id}"]`);
      
      if (fromTableElement) {
        const headerElement = fromTableElement.querySelector('.table-header');
        const columnElement = fromTableElement.querySelector('.column');
        
        let tableHeaderHeight = 36;
        let columnHeight = 32;
        
        if (headerElement) {
          tableHeaderHeight = headerElement.getBoundingClientRect().height;
        }
        if (columnElement) {
          columnHeight = columnElement.getBoundingClientRect().height;
        }
        
        setDimensions({ tableHeaderHeight, columnHeight });
        console.log(`Ölçüm tamamlandı - Header: ${tableHeaderHeight}px, Column: ${columnHeight}px`);
      } else {
        // Element henüz hazır değilse 100ms sonra tekrar dene
        setTimeout(measureDimensions, 100);
      }
    };

    // Component mount edildiğinde ve table ID'leri değiştiğinde ölç
    measureDimensions();
  }, [fromTable.id, toTable.id]);

  const { tableHeaderHeight, columnHeight } = dimensions;
  const columnCenterOffset = columnHeight / 2;
  const tableWidth = 200;

  // Kaynak kolonun tam pozisyonu
  const fromY = fromTable.y + tableHeaderHeight + (fromColumnIndex * columnHeight) + columnCenterOffset;
  
  // Hedef kolonun tam pozisyonu  
  const toY = toTable.y + tableHeaderHeight + (toColumnIndex * columnHeight) + columnCenterOffset;

  // Tablolar arası mesafeye göre çıkış ve giriş noktalarını belirle
  const isFromTableLeft = fromTable.x < toTable.x;
  
  let fromX, toX;
  
  if (isFromTableLeft) {
    // Kaynak tablo solda -> sağ kenarından çık
    fromX = fromTable.x + tableWidth;
    // Hedef tablo sağda -> sol kenarından gir  
    toX = toTable.x;
  } else {
    // Kaynak tablo sağda -> sol kenarından çık
    fromX = fromTable.x;
    // Hedef tablo solda -> sağ kenarından gir
    toX = toTable.x + tableWidth;
  }

  // SVG path oluştur
  const midX = fromX + (toX - fromX) / 2;
  const path = `M ${fromX} ${fromY} C ${midX} ${fromY}, ${midX} ${toY}, ${toX} ${toY}`;

  // İlişki tipine göre ok stili
  const getArrowMarker = () => {
    switch (relationship.type) {
      case 'one-to-one':
        return 'url(#arrow-one-to-one)';
      case 'one-to-many':
        return 'url(#arrow-one-to-many)';
      case 'many-to-many':
        return 'url(#arrow-many-to-many)';
      default:
        return 'url(#arrow-one-to-many)';
    }
  };

  return (
    <svg
      className="relationship-line"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 5
      }}
    >
      <defs>
        {/* One-to-Many arrow */}
        <marker
          id="arrow-one-to-many"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#64748b" />
        </marker>

        {/* One-to-One arrow */}
        <marker
          id="arrow-one-to-one"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#3b82f6" />
        </marker>

        {/* Many-to-Many arrow */}
        <marker
          id="arrow-many-to-many"
          viewBox="0 0 10 10"
          refX="9"
          refY="3"
          markerWidth="6"
          markerHeight="6"
          orient="auto"
        >
          <path d="M0,0 L0,6 L9,3 z" fill="#ef4444" />
        </marker>
      </defs>

      <path
        d={path}
        stroke={
          relationship.type === 'one-to-one' ? '#3b82f6' :
          relationship.type === 'many-to-many' ? '#ef4444' : '#64748b'
        }
        strokeWidth="2"
        fill="none"
        markerEnd={getArrowMarker()}
        strokeDasharray={relationship.type === 'many-to-many' ? '5,5' : 'none'}
      />

      {/* Kaynak kolon etiketi */}
      <text
        x={isFromTableLeft ? fromX - 5 : fromX + 5}
        y={fromY - 3}
        textAnchor={isFromTableLeft ? "end" : "start"}
        fontSize="10"
        fill="#059669"
        fontWeight="500"
        style={{ userSelect: 'none' }}
      >
        {fromColumn.name}
      </text>

      {/* Hedef kolon etiketi */}
      <text
        x={isFromTableLeft ? toX + 5 : toX - 5}
        y={toY - 3}
        textAnchor={isFromTableLeft ? "start" : "end"}
        fontSize="10"
        fill="#dc2626"
        fontWeight="500"
        style={{ userSelect: 'none' }}
      >
        {toColumn.name}
      </text>

      {/* İlişki tipi etiketi */}
      <text
        x={midX}
        y={fromY + (toY - fromY) / 2 - 5}
        textAnchor="middle"
        fontSize="11"
        fill="#6b7280"
        fontWeight="600"
        style={{ userSelect: 'none' }}
      >
        {relationship.type === 'one-to-one' ? '1:1' :
         relationship.type === 'one-to-many' ? '1:N' : 'N:M'}
      </text>
    </svg>
  );
};

export default RelationshipLine;
