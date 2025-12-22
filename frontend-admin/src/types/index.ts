// Member
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

export interface CreateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
}

export interface UpdateMemberDto {
  name: string;
  birthDate: string;
  birthplace?: string | null;
  penLightColor1?: string | null;
  penLightColor2?: string | null;
  groupId?: string | null;
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

export interface CreateGroupDto {
  name: string;
  debutDate?: string | null;
}

export interface UpdateGroupDto {
  name: string;
  debutDate?: string | null;
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
