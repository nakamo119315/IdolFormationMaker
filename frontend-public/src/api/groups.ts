import { apiClient } from './client';
import type { Group, GroupSummary } from '../types';

export const groupsApi = {
  getAll: () => apiClient<GroupSummary[]>('/groups'),
  getById: (id: string) => apiClient<Group>(`/groups/${id}`),
};
