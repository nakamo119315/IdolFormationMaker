import { apiClient } from './client';
import type { Setlist, SetlistSummary, CreateSetlistDto, UpdateSetlistDto } from '../types';

export const setlistsApi = {
  getAll: () => apiClient<SetlistSummary[]>('/setlists'),

  getById: (id: string) => apiClient<Setlist>(`/setlists/${id}`),

  getByGroup: (groupId: string) => apiClient<SetlistSummary[]>(`/setlists/group/${groupId}`),

  create: (data: CreateSetlistDto) =>
    apiClient<Setlist>('/setlists', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateSetlistDto) =>
    apiClient<Setlist>(`/setlists/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`/setlists/${id}`, {
      method: 'DELETE',
    }),
};
