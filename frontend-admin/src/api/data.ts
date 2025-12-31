import { apiClient } from './client';

export interface ExportDataDto {
  version: string;
  exportedAt: string;
  groups: ExportGroupDto[];
  members: ExportMemberDto[];
  formations: ExportFormationDto[];
  songs: ExportSongDto[];
  setlists: ExportSetlistDto[];
  conversations: ExportConversationDto[];
}

export interface ExportGroupDto {
  id: string;
  name: string;
  debutDate: string | null;
}

export interface ExportMemberDto {
  id: string;
  name: string;
  birthDate: string;
  birthplace: string | null;
  penLightColor1: string | null;
  penLightColor2: string | null;
  groupId: string | null;
  images: ExportMemberImageDto[];
}

export interface ExportMemberImageDto {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface ExportFormationDto {
  id: string;
  name: string;
  groupId: string;
  positions: ExportFormationPositionDto[];
}

export interface ExportFormationPositionDto {
  id: string;
  memberId: string;
  positionNumber: number;
  row: number;
  column: number;
}

export interface ExportSongDto {
  id: string;
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger: string | null;
  lyrics: string | null;
}

export interface ExportSetlistDto {
  id: string;
  name: string;
  groupId: string;
  eventDate: string | null;
  items: ExportSetlistItemDto[];
}

export interface ExportSetlistItemDto {
  id: string;
  songId: string;
  order: number;
  centerMemberId: string | null;
  participantMemberIds: string[];
}

export interface ImportResultDto {
  success: boolean;
  message: string;
  counts: ImportCountsDto;
}

export interface ImportCountsDto {
  groups: number;
  members: number;
  formations: number;
  songs: number;
  setlists: number;
  conversations: number;
}

export interface ExportConversationDto {
  id: string;
  title: string;
  memberId: string | null;
  memberName: string | null;
  conversationDate: string;
  messages: ExportConversationMessageDto[];
}

export interface ExportConversationMessageDto {
  id: string;
  speakerType: number;
  content: string;
  order: number;
}

export const dataApi = {
  export: () => apiClient<ExportDataDto>('/data/export'),
  import: (data: ExportDataDto, clearExisting = false) =>
    apiClient<ImportResultDto>(`/data/import?clearExisting=${clearExisting}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
