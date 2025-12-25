import { apiClient } from './client';
import type { Song, SongSummary } from '../types';

export const songsApi = {
  getAll: () => apiClient<SongSummary[]>('/songs'),
  getById: (id: string) => apiClient<Song>(`/songs/${id}`),
  getByGroup: (groupId: string) => apiClient<SongSummary[]>(`/songs/group/${groupId}`),
};
