export interface Member {
  id: string;
  name: string;
  birthDate: string;
  birthplace: string | null;
  penLightColor1: string | null;
  penLightColor2: string | null;
  groupId: string | null;
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
  members: Member[];
  createdAt: string;
  updatedAt: string;
}

export interface GroupSummary {
  id: string;
  name: string;
  debutDate: string | null;
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
