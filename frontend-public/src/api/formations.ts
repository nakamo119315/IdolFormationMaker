import { apiClient } from './client';
import type { Formation, CreateFormationDto, UpdateFormationDto } from '../types';

export const formationsApi = {
  getAll: () => apiClient<Formation[]>('/formations'),
  getById: (id: string) => apiClient<Formation>(`/formations/${id}`),
  create: (data: CreateFormationDto) =>
    apiClient<Formation>('/formations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  update: (id: string, data: UpdateFormationDto) =>
    apiClient<Formation>(`/formations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<void>(`/formations/${id}`, {
      method: 'DELETE',
    }),
};
