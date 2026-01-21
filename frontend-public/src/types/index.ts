export interface Member {
  id: string;
  name: string;
  birthDate: string;
  birthplace: string | null;
  penLightColor1: string | null;
  penLightColor2: string | null;
  groupId: string | null;
  generation: number | null;
  isGraduated: boolean;
  nickname: string | null;
  callName: string | null;
  images: MemberImage[];
  createdAt: string;
  updatedAt: string;
}

export interface MemberImage {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  debutDate: string | null;
  hasGeneration: boolean;
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  debutDate: string | null;
  hasGeneration: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Formation {
  id: string;
  name: string;
  groupId: string;
  positions: FormationPosition[];
  createdAt: string;
  updatedAt: string;
}

export interface FormationPosition {
  id: string;
  memberId: string;
  positionNumber: number;
  row: number;
  column: number;
}

export interface CreateFormationDto {
  name: string;
  groupId: string;
  positions: CreateFormationPositionDto[];
}

export interface CreateFormationPositionDto {
  memberId: string;
  positionNumber: number;
  row: number;
  column: number;
}

export interface UpdateFormationDto {
  name: string;
  groupId: string;
  positions: CreateFormationPositionDto[];
}

export interface Song {
  id: string;
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger: string | null;
  lyrics: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SongSummary {
  id: string;
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Setlist {
  id: string;
  name: string;
  groupId: string;
  eventDate: string | null;
  items: SetlistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface SetlistSummary {
  id: string;
  name: string;
  groupId: string;
  eventDate: string | null;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SetlistItem {
  id: string;
  songId: string;
  order: number;
  centerMemberId: string | null;
  participantMemberIds: string[];
}

export interface CreateSetlistDto {
  name: string;
  groupId: string;
  eventDate?: string | null;
  items: CreateSetlistItemDto[];
}

export interface CreateSetlistItemDto {
  songId: string;
  order: number;
  centerMemberId?: string | null;
  participantMemberIds?: string[] | null;
}

export interface UpdateSetlistDto {
  name: string;
  eventDate?: string | null;
  items: CreateSetlistItemDto[];
}

// Conversation types
export interface MeetGreetConversation {
  id: string;
  title: string;
  memberId: string | null;
  memberName: string | null;
  conversationDate: string;
  messages: ConversationMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationSummary {
  id: string;
  title: string;
  memberId: string | null;
  memberName: string | null;
  conversationDate: string;
  messageCount: number;
  previewText: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationMessage {
  id: string;
  speakerType: SpeakerType;
  content: string;
  order: number;
  createdAt: string;
}

export type SpeakerType = 'Self' | 'Partner';

export interface CreateConversationDto {
  title: string;
  memberId?: string | null;
  conversationDate?: string;
  messages: CreateMessageDto[];
}

export interface CreateMessageDto {
  speakerType: SpeakerType;
  content: string;
  order: number;
}

export interface UpdateConversationDto {
  title: string;
  memberId: string | null;
  conversationDate: string | null;
  messages: CreateMessageDto[];
}

export interface AddMessageDto {
  speakerType: SpeakerType;
  content: string;
}

// Member DTOs
export interface CreateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
  generation?: number | null;
  isGraduated?: boolean;
  nickname?: string | null;
  callName?: string | null;
}

export interface UpdateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
  generation?: number | null;
  isGraduated: boolean;
  nickname?: string | null;
  callName?: string | null;
}

// Song DTOs
export interface CreateSongDto {
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger?: string | null;
  lyrics?: string | null;
}

export interface UpdateSongDto {
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger?: string | null;
  lyrics?: string | null;
}
