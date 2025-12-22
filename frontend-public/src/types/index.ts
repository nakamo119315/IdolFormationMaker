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
