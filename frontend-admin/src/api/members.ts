import { apiClient } from './client';
import type { Member, CreateMemberDto, UpdateMemberDto, MemberImage, AddMemberImageDto, PagedResult } from '../types';

export interface MemberSearchParams {
  page?: number;
  pageSize?: number;
  search?: string;
  groupId?: string;
  generation?: number;
  isGraduated?: boolean;
}

export const membersApi = {
  getAll: () => apiClient<Member[]>('/members'),

  getPaged: (params: MemberSearchParams = {}) => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page.toString());
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString());
    if (params.search) queryParams.set('search', params.search);
    if (params.groupId) queryParams.set('groupId', params.groupId);
    if (params.generation) queryParams.set('generation', params.generation.toString());
    if (params.isGraduated !== undefined) queryParams.set('isGraduated', params.isGraduated.toString());
    const query = queryParams.toString();
    return apiClient<PagedResult<Member>>(`/members/paged${query ? `?${query}` : ''}`);
  },

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

  exportCsv: async () => {
    const response = await fetch('/api/members/export');
    if (!response.ok) throw new Error('Export failed');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `members_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  },
};
