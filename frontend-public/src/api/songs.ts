import { apiClient } from './client';
import type { Song, SongSummary, CreateSongDto, UpdateSongDto } from '../types';

export const songsApi = {
  getAll: () => apiClient<SongSummary[]>('/songs'),
  getById: (id: string) => apiClient<Song>(`/songs/${id}`),
  getByGroup: (groupId: string) => apiClient<SongSummary[]>(`/songs/group/${groupId}`),
  create: (data: CreateSongDto) =>
    apiClient<Song>('/songs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateSongDto) =>
    apiClient<Song>(`/songs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<void>(`/songs/${id}`, {
      method: 'DELETE',
    }),
};
