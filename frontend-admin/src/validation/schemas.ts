import { z } from 'zod';

// Member schemas
export const createMemberSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(100, '名前は100文字以内で入力してください'),
  birthDate: z.string().min(1, '生年月日は必須です'),
  birthplace: z.string().max(100, '出身地は100文字以内で入力してください').nullable().optional(),
  penLightColor1: z.string().max(50, 'ペンライトカラー1は50文字以内で入力してください').nullable().optional(),
  penLightColor2: z.string().max(50, 'ペンライトカラー2は50文字以内で入力してください').nullable().optional(),
  groupId: z.string().uuid().nullable().optional(),
  generation: z.number().int().min(1, '期は1以上を入力してください').max(99, '期は99以下を入力してください').nullable().optional(),
  isGraduated: z.boolean().optional(),
});

export const updateMemberSchema = createMemberSchema;

// Group schemas
export const createGroupSchema = z.object({
  name: z.string().min(1, 'グループ名は必須です').max(200, 'グループ名は200文字以内で入力してください'),
  debutDate: z.string().nullable().optional(),
  hasGeneration: z.boolean().optional(),
});

export const updateGroupSchema = createGroupSchema;

// Song schemas
export const createSongSchema = z.object({
  groupId: z.string().uuid('グループは必須です'),
  title: z.string().min(1, '曲名は必須です').max(300, '曲名は300文字以内で入力してください'),
  lyricist: z.string().min(1, '作詞者は必須です').max(200, '作詞者は200文字以内で入力してください'),
  composer: z.string().min(1, '作曲者は必須です').max(200, '作曲者は200文字以内で入力してください'),
  arranger: z.string().max(200, '編曲者は200文字以内で入力してください').nullable().optional(),
  lyrics: z.string().max(10000, '歌詞は10000文字以内で入力してください').nullable().optional(),
});

export const updateSongSchema = createSongSchema.omit({ groupId: true });

// Formation schemas
export const formationPositionSchema = z.object({
  memberId: z.string().uuid('メンバーは必須です'),
  positionNumber: z.number().int().min(1, 'ポジション番号は1以上を指定してください').max(99),
  row: z.number().int().min(1, '列は1以上を指定してください').max(10),
  column: z.number().int().min(1, '行は1以上を指定してください').max(20),
});

export const createFormationSchema = z.object({
  name: z.string().min(1, 'フォーメーション名は必須です').max(300, 'フォーメーション名は300文字以内で入力してください'),
  groupId: z.string().uuid('グループは必須です'),
  positions: z.array(formationPositionSchema).min(1, 'ポジションを1つ以上指定してください'),
});

export const updateFormationSchema = createFormationSchema;

// Image schemas
export const addMemberImageSchema = z.object({
  url: z.string().url('有効なURLを入力してください').max(2000, 'URLは2000文字以内で入力してください'),
  isPrimary: z.boolean().optional(),
});

// Type exports
export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
export type CreateSongInput = z.infer<typeof createSongSchema>;
export type UpdateSongInput = z.infer<typeof updateSongSchema>;
export type CreateFormationInput = z.infer<typeof createFormationSchema>;
export type UpdateFormationInput = z.infer<typeof updateFormationSchema>;
export type AddMemberImageInput = z.infer<typeof addMemberImageSchema>;
