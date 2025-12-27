/**
 * 日本語テキスト正規化ユーティリティ
 * 検索時の表記ゆれを吸収する
 */

// カタカナをひらがなに変換
function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0x60);
  });
}

// 全角英数字を半角に変換
function fullWidthToHalfWidth(str: string): string {
  return str
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    })
    .replace(/\u3000/g, ' '); // 全角スペースを半角に
}

// 特殊文字の正規化
function normalizeSymbols(str: string): string {
  return str
    .replace(/[〜～]/g, '~')
    .replace(/[ー－―]/g, '-')
    .replace(/[！]/g, '!')
    .replace(/[？]/g, '?')
    .replace(/['']/g, "'")
    .replace(/[""]/g, '"')
    .replace(/[・]/g, '');
}

/**
 * 検索用にテキストを正規化
 * - 小文字化
 * - カタカナ → ひらがな
 * - 全角 → 半角
 * - 特殊文字の正規化
 */
export function normalizeForSearch(text: string): string {
  let normalized = text.toLowerCase();
  normalized = katakanaToHiragana(normalized);
  normalized = fullWidthToHalfWidth(normalized);
  normalized = normalizeSymbols(normalized);
  return normalized;
}

/**
 * 検索マッチング関数
 * query が target に含まれるかを正規化して判定
 * スペース区切りで複数ワードAND検索対応
 * 例: "青空 夏" → "青空"と"夏"の両方を含む曲にマッチ
 */
export function matchesSearch(target: string, query: string): boolean {
  if (!query) return true;
  const normalizedTarget = normalizeForSearch(target);

  // スペースで分割して各ワードがすべて含まれているかチェック
  const words = query.trim().split(/\s+/).filter(w => w.length > 0);

  return words.every(word => {
    const normalizedWord = normalizeForSearch(word);
    return normalizedTarget.includes(normalizedWord);
  });
}
