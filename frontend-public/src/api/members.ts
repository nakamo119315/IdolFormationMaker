import { apiClient } from './client';
import type { Member } from '../types';

export const membersApi = {
  getAll: () => apiClient<Member[]>('/members'),
  getById: (id: string) => apiClient<Member>(`/members/${id}`),
};
