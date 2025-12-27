import { apiClient } from './client';
import type { Group, GroupSummary, CreateGroupDto, UpdateGroupDto, PagedResult } from '../types';

export interface GroupSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
}

export const groupsApi = {
  getAll: () => apiClient<GroupSummary[]>('/groups'),

  getPaged: (params: GroupSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('search', params.search);
    const query = queryParams.toString();
    return apiClient<PagedResult<GroupSummary>>(`/groups/paged${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiClient<Group>(`/groups/${id}`),

  create: (data: CreateGroupDto) =>
    apiClient<Group>('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: UpdateGroupDto) =>
    apiClient<Group>(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiClient<void>(`/groups/${id}`, {
      method: 'DELETE',
    }),

  deleteBulk: (ids: string[]) =>
    apiClient<{ deletedCount: number }>('/groups/bulk', {
      method: 'DELETE',
      body: JSON.stringify({ ids }),
    }),
};
