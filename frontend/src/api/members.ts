import { apiClient } from './client';
import type { Member, CreateMemberDto, UpdateMemberDto, MemberImage, AddMemberImageDto } from '../types';

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

  addImage: (memberId: string, data: AddMemberImageDto) =>
    apiClient<MemberImage>(`/members/${memberId}/images`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deleteImage: (memberId: string, imageId: string) =>
    apiClient<void>(`/members/${memberId}/images/${imageId}`, {
      method: 'DELETE',
    }),
};
