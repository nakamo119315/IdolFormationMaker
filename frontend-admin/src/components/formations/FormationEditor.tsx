import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  useDraggable,
  useDroppable,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import type { Member, CreateFormationPositionDto } from '../../types';
import './FormationEditor.css';

interface FormationEditorProps {
  members: Member[];
  allMembers: Member[];  // 全メンバー（配置済みメンバーの表示用）
  positions: CreateFormationPositionDto[];
  onChange: (positions: CreateFormationPositionDto[]) => void;
}

interface GridCell {
  row: number;
  column: number;
}

const ROWS = 5;
const COLUMNS = 12;

// ドラッグ可能なメンバーカード
function DraggableMember({ member, isPlaced }: { member: Member; isPlaced: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { member, type: 'member' },
  });

  const imageUrl = member.images.find(img => img.isPrimary)?.url ?? member.images[0]?.url;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`draggable-member ${isDragging ? 'dragging' : ''} ${isPlaced ? 'placed' : ''}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={member.name} className="member-thumb" />
      ) : (
        <div className="member-thumb-placeholder">{member.name.charAt(0)}</div>
      )}
      <span className="member-name-small">{member.name}</span>
    </div>
  );
}

// 配置済みメンバー（グリッド上）
function PlacedMember({
  member,
  positionNumber,
  onRemove
}: {
  member: Member;
  positionNumber: number;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `placed-${member.id}`,
    data: { member, type: 'placed' },
  });

  const imageUrl = member.images.find(img => img.isPrimary)?.url ?? member.images[0]?.url;

  return (
    <div className={`placed-member-wrapper ${isDragging ? 'dragging' : ''}`}>
      {/* ドラッグ可能な領域 */}
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        className="placed-member"
      >
        <div className="position-badge">{positionNumber}</div>
        {imageUrl ? (
          <img src={imageUrl} alt={member.name} className="placed-thumb" draggable={false} />
        ) : (
          <div className="placed-thumb-placeholder">{member.name.charAt(0)}</div>
        )}
      </div>
      {/* 削除ボタン - ドラッグ領域の後に配置（z-indexで前面） */}
      <div
        className="remove-btn-container"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="remove-btn"
          onClick={() => onRemove()}
        >×</button>
      </div>
    </div>
  );
}

// ドロップ可能なグリッドセル
function DroppableCell({
  row,
  column,
  children,
  isOver
}: {
  row: number;
  column: number;
  children?: React.ReactNode;
  isOver: boolean;
}) {
  const { setNodeRef } = useDroppable({
    id: `cell-${row}-${column}`,
    data: { row, column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`grid-cell ${isOver ? 'drag-over' : ''} ${children ? 'occupied' : ''}`}
    >
      {children}
    </div>
  );
}

export function FormationEditor({ members, allMembers, positions, onChange }: FormationEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCell, setOverCell] = useState<GridCell | null>(null);

  // タッチとマウス両方に対応するセンサー設定
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5, // 5px動かしてからドラッグ開始（誤操作防止）
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 200, // 200ms長押しでドラッグ開始
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  // 配置済みメンバーのIDセット
  const placedMemberIds = new Set(positions.map(p => p.memberId));

  // グリッドデータを作成
  const getPositionAt = (row: number, column: number) => {
    return positions.find(p => p.row === row && p.column === column);
  };

  // allMembersから検索（配置済みメンバーの表示用）
  const getMemberById = (id: string) => allMembers.find(m => m.id === id);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over;
    if (over && over.id.toString().startsWith('cell-')) {
      const [, row, column] = over.id.toString().split('-');
      setOverCell({ row: parseInt(row), column: parseInt(column) });
    } else {
      setOverCell(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setOverCell(null);

    if (!over) return;

    const overId = over.id.toString();
    if (!overId.startsWith('cell-')) return;

    const [, rowStr, colStr] = overId.split('-');
    const targetRow = parseInt(rowStr);
    const targetColumn = parseInt(colStr);

    const activeData = active.data.current as { member: Member; type: string };
    const member = activeData.member;

    // 既にそのセルに配置されているか確認
    const existingPosition = getPositionAt(targetRow, targetColumn);
    if (existingPosition && existingPosition.memberId !== member.id) {
      return; // セルが占有されている
    }

    let newPositions = [...positions];

    if (activeData.type === 'placed') {
      // 配置済みメンバーの移動
      newPositions = newPositions.filter(p => p.memberId !== member.id);
    }

    // 既に配置されていたら削除
    newPositions = newPositions.filter(p => p.memberId !== member.id);

    // 新しい位置に配置
    const nextPositionNumber = Math.max(0, ...newPositions.map(p => p.positionNumber)) + 1;
    newPositions.push({
      memberId: member.id,
      positionNumber: activeData.type === 'placed'
        ? positions.find(p => p.memberId === member.id)?.positionNumber ?? nextPositionNumber
        : nextPositionNumber,
      row: targetRow,
      column: targetColumn,
    });

    // ポジション番号を振り直し（row順、column順）
    newPositions.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });
    newPositions = newPositions.map((p, idx) => ({ ...p, positionNumber: idx + 1 }));

    onChange(newPositions);
  };

  const handleRemove = (memberId: string) => {
    let newPositions = positions.filter(p => p.memberId !== memberId);
    // ポジション番号を振り直し
    newPositions = newPositions.map((p, idx) => ({ ...p, positionNumber: idx + 1 }));
    onChange(newPositions);
  };

  const activeMember = activeId
    ? getMemberById(activeId.replace('member-', '').replace('placed-', ''))
    : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="formation-editor">
        {/* メンバーリスト */}
        <div className="member-list">
          <h4>メンバー</h4>
          <p className="drag-hint">長押しでドラッグ</p>
          <div className="member-list-scroll">
            {members.map(member => (
              <DraggableMember
                key={member.id}
                member={member}
                isPlaced={placedMemberIds.has(member.id)}
              />
            ))}
          </div>
        </div>

        {/* グリッド */}
        <div className="formation-grid-editor">
          <div className="grid-label-top">ステージ後方</div>
          <div className="grid-container">
            {Array.from({ length: ROWS }, (_, rowIdx) => {
              const row = ROWS - rowIdx; // 上から5,4,3,2,1
              return (
                <div key={row} className="grid-row">
                  <div className="grid-row-label">{row}列目</div>
                  {Array.from({ length: COLUMNS }, (_, colIdx) => {
                    const column = colIdx + 1;
                    const position = getPositionAt(row, column);
                    const member = position ? getMemberById(position.memberId) : null;
                    const isOver = overCell?.row === row && overCell?.column === column;

                    return (
                      <DroppableCell
                        key={`${row}-${column}`}
                        row={row}
                        column={column}
                        isOver={isOver}
                      >
                        {member && position && (
                          <PlacedMember
                            member={member}
                            positionNumber={position.positionNumber}
                            onRemove={() => handleRemove(member.id)}
                          />
                        )}
                      </DroppableCell>
                    );
                  })}
                </div>
              );
            })}
          </div>
          <div className="grid-label-bottom">ステージ前方（客席側）</div>
        </div>
      </div>

      {/* ドラッグ中のオーバーレイ */}
      <DragOverlay>
        {activeMember && (
          <div className="drag-overlay-member">
            {activeMember.images[0]?.url ? (
              <img src={activeMember.images[0].url} alt={activeMember.name} />
            ) : (
              <div className="drag-overlay-placeholder">{activeMember.name.charAt(0)}</div>
            )}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
