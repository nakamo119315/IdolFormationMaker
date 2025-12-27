import { apiClient } from './client';
import type { Song, SongSummary, CreateSongDto, UpdateSongDto, PagedResult } from '../types';

export interface SongSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  groupId?: string;
}

export const songsApi = {
  getAll: () => apiClient<SongSummary[]>('/songs'),

  getPaged: (params: SongSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.groupId) queryParams.set('groupId', params.groupId);
    const query = queryParams.toString();
    return apiClient<PagedResult<SongSummary>>(`/songs/paged${query ? `?${query}` : ''}`);
  },

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

  deleteBulk: (ids: string[]) =>
    apiClient<{ deletedCount: number }>('/songs/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),

  exportCsv: async () => {
    const response = await fetch('/api/songs/export');
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `songs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
