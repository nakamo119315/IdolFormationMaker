// Paged Result
export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Member
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

export interface CreateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
  generation?: number | null;
  isGraduated?: boolean;
}

export interface UpdateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
  generation?: number | null;
  isGraduated?: boolean;
}

export interface AddMemberImageDto {
  url: string;
  isPrimary: boolean;
}

// Group
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

export interface CreateGroupDto {
  name: string;
  debutDate?: string | null;
  hasGeneration?: boolean;
}

export interface UpdateGroupDto {
  name: string;
  debutDate?: string | null;
  hasGeneration?: boolean;
}

// Formation
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

// Song
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

export interface CreateSongDto {
  groupId: string;
  title: string;
  lyricist: string;
  composer: string;
  arranger?: string | null;
  lyrics?: string | null;
}

export interface UpdateSongDto {
  title: string;
  lyricist: string;
  composer: string;
  arranger?: string | null;
  lyrics?: string | null;
}

// Setlist
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
