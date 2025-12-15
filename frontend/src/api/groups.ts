import { apiClient } from './client';
import type { Group, GroupSummary, CreateGroupDto, UpdateGroupDto } from '../types';

export const groupsApi = {
  getAll: () => apiClient<GroupSummary[]>('/groups'),

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
};
