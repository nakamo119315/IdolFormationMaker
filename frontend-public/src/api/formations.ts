import { apiClient } from './client';
import type { Formation } from '../types';

export const formationsApi = {
  getAll: () => apiClient<Formation[]>('/formations'),
  getById: (id: string) => apiClient<Formation>(`/formations/${id}`),
};
