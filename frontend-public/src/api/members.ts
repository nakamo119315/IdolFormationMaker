import { apiClient } from './client';
import type { Member, CreateMemberDto, UpdateMemberDto } from '../types';

export const membersApi = {
  getAll: () => apiClient<Member[]>('/members'),
  getById: (id: string) => apiClient<Member>(`/members/${id}`),
  create: (data: CreateMemberDto) =>
    apiClient<Member>('/members', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateMemberDto) =>
    apiClient<Member>(`/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<void>(`/members/${id}`, {
      method: 'DELETE',
    }),
};
