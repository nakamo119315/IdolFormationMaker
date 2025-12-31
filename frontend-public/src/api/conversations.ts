import { apiClient } from './client';
import type {
  MeetGreetConversation,
  ConversationSummary,
  CreateConversationDto,
  UpdateConversationDto,
  AddMessageDto,
  ConversationMessage,
} from '../types';

export const conversationsApi = {
  getAll: (memberId?: string) =>
    apiClient<ConversationSummary[]>(
      memberId ? `/conversations?memberId=${memberId}` : '/conversations'
    ),
  getById: (id: string) => apiClient<MeetGreetConversation>(`/conversations/${id}`),
  create: (dto: CreateConversationDto) =>
    apiClient<MeetGreetConversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
  update: (id: string, dto: UpdateConversationDto) =>
    apiClient<MeetGreetConversation>(`/conversations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),
  delete: (id: string) =>
    apiClient<void>(`/conversations/${id}`, {
      method: 'DELETE',
    }),
  addMessage: (id: string, dto: AddMessageDto) =>
    apiClient<ConversationMessage>(`/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify(dto),
    }),
};
