import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

interface FormationEditorProps {
  members: Member[];
  allMembers: Member[];  // For looking up placed members
  positions: CreateFormationPositionDto[];
  onChange: (positions: CreateFormationPositionDto[]) => void;
}

interface GridCell {
  row: number;
  column: number;
}

const ROWS = 5;
const COLUMNS = 10;

function DraggableMember({ member, isPlaced }: { member: Member; isPlaced: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `member-${member.id}`,
    data: { member, type: 'member' },
  });

  const imageUrl = member.images.find(img => img.isPrimary)?.url ?? member.images[0]?.url;

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isPlaced ? 0.5 : 1, scale: 1 }}
      className={`flex items-center gap-2 p-2 bg-white rounded-xl border-2 transition-all duration-200 cursor-grab touch-none select-none ${
        isDragging ? 'opacity-50 scale-95' : ''
      } ${isPlaced ? 'border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-primary-400 hover:shadow-md'}`}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">
          {member.name.charAt(0)}
        </div>
      )}
      <span className="text-xs text-slate-700 truncate flex-1">{member.name}</span>
    </motion.div>
  );
}

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
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      initial={{ scale: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.5 : 1 }}
      exit={{ scale: 0 }}
      className="relative w-10 h-10 sm:w-12 sm:h-12 cursor-grab touch-none select-none group"
    >
      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold z-10 shadow-md">
        {positionNumber}
      </div>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={member.name}
          className="w-full h-full rounded-full object-cover border-2 border-white shadow-lg"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold border-2 border-white shadow-lg">
          {member.name.charAt(0)}
        </div>
      )}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1.5 -left-1.5 w-5 h-5 bg-slate-500 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity z-10"
      >
        x
      </button>
    </motion.div>
  );
}

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
      className={`w-10 h-10 sm:w-14 sm:h-14 rounded-lg border-2 border-dashed flex items-center justify-center transition-all duration-200 ${
        isOver
          ? 'bg-primary-100 border-primary-400 scale-105'
          : children
            ? 'border-transparent bg-transparent'
            : 'border-slate-200/50 bg-white/30 hover:bg-white/50'
      }`}
    >
      {children}
    </div>
  );
}

export function FormationEditor({ members, allMembers, positions, onChange }: FormationEditorProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overCell, setOverCell] = useState<GridCell | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 150,
      tolerance: 5,
    },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const placedMemberIds = new Set(positions.map(p => p.memberId));

  const getPositionAt = (row: number, column: number) => {
    return positions.find(p => p.row === row && p.column === column);
  };

  // Use allMembers for lookup to find placed members even if they're not in filtered list
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

    const existingPosition = getPositionAt(targetRow, targetColumn);
    if (existingPosition && existingPosition.memberId !== member.id) {
      return;
    }

    let newPositions = positions.filter(p => p.memberId !== member.id);

    const nextPositionNumber = Math.max(0, ...newPositions.map(p => p.positionNumber)) + 1;
    newPositions.push({
      memberId: member.id,
      positionNumber: activeData.type === 'placed'
        ? positions.find(p => p.memberId === member.id)?.positionNumber ?? nextPositionNumber
        : nextPositionNumber,
      row: targetRow,
      column: targetColumn,
    });

    newPositions.sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.column - b.column;
    });
    newPositions = newPositions.map((p, idx) => ({ ...p, positionNumber: idx + 1 }));

    onChange(newPositions);
  };

  const handleRemove = (memberId: string) => {
    let newPositions = positions.filter(p => p.memberId !== memberId);
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
      <div className="space-y-6">
        {/* Member List */}
        <div className="bg-slate-50 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-slate-600">メンバー</h4>
            <span className="text-xs text-slate-400 hidden sm:inline">ドラッグしてステージに配置</span>
            <span className="text-xs text-slate-400 sm:hidden">長押しでドラッグ</span>
          </div>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
            {members.map(member => (
              <DraggableMember
                key={member.id}
                member={member}
                isPlaced={placedMemberIds.has(member.id)}
              />
            ))}
            {members.length === 0 && (
              <p className="text-sm text-slate-400 py-4 text-center w-full">
                グループを選択してください
              </p>
            )}
          </div>
        </div>

        {/* Stage Grid */}
        <div className="relative">
          {/* Stage Label Top */}
          <div className="text-center mb-2">
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              ステージ後方
            </span>
          </div>

          {/* Grid Container */}
          <div className="bg-gradient-to-b from-slate-100 to-slate-50 rounded-3xl p-4 sm:p-6 overflow-x-auto">
            <div className="flex flex-col gap-2 sm:gap-3 min-w-fit mx-auto" style={{ width: 'fit-content' }}>
              {Array.from({ length: ROWS }, (_, rowIdx) => {
                const row = ROWS - rowIdx;
                return (
                  <motion.div
                    key={row}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: rowIdx * 0.05 }}
                    className="flex items-center gap-1 sm:gap-2"
                  >
                    <div className="w-10 text-right pr-2 text-[10px] sm:text-xs text-slate-400 flex-shrink-0">
                      {row}列目
                    </div>
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
                          <AnimatePresence>
                            {member && position && (
                              <PlacedMember
                                member={member}
                                positionNumber={position.positionNumber}
                                onRemove={() => handleRemove(member.id)}
                              />
                            )}
                          </AnimatePresence>
                        </DroppableCell>
                      );
                    })}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Stage Label Bottom */}
          <div className="text-center mt-2">
            <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              ステージ前方（客席側）
            </span>
          </div>
        </div>

        {/* Position Count */}
        <div className="text-center">
          <span className="text-sm text-slate-500">
            配置済み: <span className="font-semibold text-primary-600">{positions.length}</span> 人
          </span>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeMember && (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="w-12 h-12"
          >
            {activeMember.images[0]?.url ? (
              <img
                src={activeMember.images[0].url}
                alt={activeMember.name}
                className="w-full h-full rounded-full object-cover border-3 border-primary-500 shadow-xl"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold shadow-xl">
                {activeMember.name.charAt(0)}
              </div>
            )}
          </motion.div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
