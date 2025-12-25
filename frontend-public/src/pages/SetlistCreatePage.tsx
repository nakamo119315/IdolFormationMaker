import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { setlistsApi } from '../api/setlists';
import { songsApi } from '../api/songs';
import { groupsApi } from '../api/groups';
import { Loading } from '../components/common/Loading';
import type { CreateSetlistItemDto, Member } from '../types';

interface SetlistItemForm extends CreateSetlistItemDto {
  tempId: string;
}

function SortableItem({
  item,
  getSongTitle,
  onRemove,
  onUpdate,
  members,
}: {
  item: SetlistItemForm;
  getSongTitle: (id: string) => string;
  onRemove: () => void;
  onUpdate: (item: SetlistItemForm) => void;
  members: Member[];
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.tempId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg shadow-sm border border-slate-200 p-3 mb-2"
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm leading-snug">
            <span className="text-rose-500 mr-1">{item.order}.</span>
            {getSongTitle(item.songId)}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <label className="text-xs text-slate-500 flex-shrink-0">センター:</label>
            <select
              value={item.centerMemberId || ''}
              onChange={(e) => onUpdate({ ...item, centerMemberId: e.target.value || null })}
              className="flex-1 text-sm border border-slate-200 rounded px-2 py-1"
            >
              <option value="">未選択</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="p-1 text-slate-400 hover:text-red-500 flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function SetlistCreatePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const [name, setName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [items, setItems] = useState<SetlistItemForm[]>([]);
  const [selectedSongId, setSelectedSongId] = useState('');
  const [songSearch, setSongSearch] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const { data: groups } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getAll,
  });

  const { data: songs } = useQuery({
    queryKey: ['songs', groupId],
    queryFn: () => groupId ? songsApi.getByGroup(groupId) : songsApi.getAll(),
    enabled: true,
  });

  const { data: groupDetail } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => groupsApi.getById(groupId),
    enabled: !!groupId,
  });

  const { data: existingSetlist, isLoading: setlistLoading } = useQuery({
    queryKey: ['setlist', id],
    queryFn: () => setlistsApi.getById(id!),
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingSetlist) {
      setName(existingSetlist.name);
      setGroupId(existingSetlist.groupId);
      setEventDate(existingSetlist.eventDate || '');
      setItems(
        existingSetlist.items.map((item) => ({
          tempId: item.id,
          songId: item.songId,
          order: item.order,
          centerMemberId: item.centerMemberId,
          participantMemberIds: item.participantMemberIds,
        }))
      );
    }
  }, [existingSetlist]);

  const createMutation = useMutation({
    mutationFn: setlistsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
      navigate('/setlists');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof setlistsApi.update>[1] }) =>
      setlistsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['setlists'] });
      queryClient.invalidateQueries({ queryKey: ['setlist', id] });
      navigate(`/setlists/${id}`);
    },
  });

  const members = groupDetail?.members || [];

  const getSongTitle = (songId: string) => songs?.find((s) => s.id === songId)?.title ?? '不明';

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((i) => i.tempId === active.id);
        const newIndex = items.findIndex((i) => i.tempId === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        return newItems.map((item, index) => ({ ...item, order: index + 1 }));
      });
    }
  };

  const addSong = () => {
    if (!selectedSongId) return;
    setItems((prev) => [
      ...prev,
      {
        tempId: `temp-${Date.now()}`,
        songId: selectedSongId,
        order: prev.length + 1,
        centerMemberId: null,
        participantMemberIds: null,
      },
    ]);
    setSelectedSongId('');
  };

  const removeSong = (tempId: string) => {
    setItems((prev) => {
      const filtered = prev.filter((i) => i.tempId !== tempId);
      return filtered.map((item, index) => ({ ...item, order: index + 1 }));
    });
  };

  const updateItem = (updatedItem: SetlistItemForm) => {
    setItems((prev) => prev.map((item) => (item.tempId === updatedItem.tempId ? updatedItem : item)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const itemsToSubmit = items.map(({ songId, order, centerMemberId, participantMemberIds }) => ({
      songId,
      order,
      centerMemberId,
      participantMemberIds,
    }));

    if (isEdit && id) {
      updateMutation.mutate({
        id,
        data: { name, eventDate: eventDate || null, items: itemsToSubmit },
      });
    } else {
      createMutation.mutate({
        name,
        groupId,
        eventDate: eventDate || null,
        items: itemsToSubmit,
      });
    }
  };

  if (isEdit && setlistLoading) return <Loading />;

  const filteredSongs = songs?.filter((s) => {
    const matchesGroup = !groupId || s.groupId === groupId;
    const matchesSearch = !songSearch || s.title.toLowerCase().includes(songSearch.toLowerCase());
    return matchesGroup && matchesSearch;
  }) || [];

  const firstFilteredSongId = filteredSongs.length > 0 ? filteredSongs[0].id : null;

  // 検索時に最初の曲を自動選択
  useEffect(() => {
    if (songSearch && firstFilteredSongId) {
      setSelectedSongId(firstFilteredSongId);
    }
  }, [songSearch, firstFilteredSongId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link
            to="/setlists"
            className="inline-flex items-center text-slate-500 hover:text-rose-500 transition-colors mb-4"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </Link>
          <h1 className="text-3xl font-bold text-slate-800">
            {isEdit ? 'セトリ編集' : 'セトリ作成'}
          </h1>
        </motion.div>

        <form onSubmit={handleSubmit}>
          {/* 基本情報 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100"
          >
            <h2 className="text-lg font-bold text-slate-800 mb-4">基本情報</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">セトリ名</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例: 2024/12/25 Xmasライブ"
                  className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">グループ</label>
                  <select
                    value={groupId}
                    onChange={(e) => {
                      setGroupId(e.target.value);
                      setItems([]);
                    }}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    required
                    disabled={isEdit}
                  >
                    <option value="">選択してください</option>
                    {groups?.map((group) => (
                      <option key={group.id} value={group.id}>{group.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">日付（任意）</label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 楽曲追加 */}
          {groupId && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg p-6 mb-6 border border-slate-100"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">
                楽曲を追加
                <span className="ml-2 text-sm font-normal text-slate-500">({filteredSongs.length}曲)</span>
              </h2>
              <div className="space-y-3">
                {/* 検索入力 */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={songSearch}
                    onChange={(e) => setSongSearch(e.target.value)}
                    placeholder="曲名で検索..."
                    className="w-full border border-slate-200 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  {songSearch && (
                    <button
                      type="button"
                      onClick={() => setSongSearch('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                {/* 曲選択 */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1">
                    <select
                      value={selectedSongId}
                      onChange={(e) => setSelectedSongId(e.target.value)}
                      className="w-full border border-slate-200 rounded-lg px-4 py-2 focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    >
                      <option value="">曲を選択してください</option>
                      {filteredSongs.map((song) => (
                        <option key={song.id} value={song.id}>{song.title}</option>
                      ))}
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addSong();
                      setSongSearch('');
                    }}
                    disabled={!selectedSongId}
                    className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    追加
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* セトリ */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-50 rounded-2xl p-6 mb-6"
            >
              <h2 className="text-lg font-bold text-slate-800 mb-4">セットリスト（ドラッグで並べ替え）</h2>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={items.map((i) => i.tempId)} strategy={verticalListSortingStrategy}>
                  {items.map((item) => (
                    <SortableItem
                      key={item.tempId}
                      item={item}
                      getSongTitle={getSongTitle}
                      onRemove={() => removeSong(item.tempId)}
                      onUpdate={updateItem}
                      members={members}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </motion.div>
          )}

          {/* 送信ボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-end gap-4"
          >
            <Link
              to="/setlists"
              className="px-6 py-3 text-slate-600 hover:text-slate-800 transition-colors"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={!name || !groupId || items.length === 0}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg"
            >
              {isEdit ? '更新する' : '作成する'}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
