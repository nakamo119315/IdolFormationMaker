# Conversation Image Export Feature

Implementation of User Story 3 (T043-T046) for ミーグリ会話記録 image export.

## Files Implemented

### 1. Hook: `useExportToImage.ts` (T044)
Location: `/frontend-public/src/hooks/useExportToImage.ts`

Custom React hook for exporting HTML elements to PNG images using html2canvas.

**Features:**
- High-quality export (2x scale)
- Loading state management
- CORS-enabled for external images
- Automatic download with custom filename
- Error handling

**Usage:**
```typescript
const { exportToImage, isExporting } = useExportToImage();

await exportToImage(elementRef.current, 'filename.png');
```

### 2. Component: `ExportableChat.tsx` (T043, T046)
Location: `/frontend-public/src/components/conversations/ExportableChat.tsx`

Optimized chat layout component specifically designed for clean image exports.

**Features:**
- Fixed 1080px width for consistent exports
- Header with member image (circular), title, date
- LINE-style chat bubbles (blue for Self, gray for Partner)
- Sorted messages by order
- Clean white background
- Print-friendly typography
- Uses `forwardRef` for parent ref access

**Props:**
```typescript
interface ExportableChatProps {
  conversation: MeetGreetConversation;
  memberImageUrl?: string;
}
```

**Layout:**
```
┌─────────────────────────────────┐
│  [Member Image]  会話タイトル   │  Header (with border)
│                  2024-12-30      │
├─────────────────────────────────┤
│                                  │
│  ┌─────────────┐                 │  Partner message
│  │ 相手: こんにちは │            │  (left-aligned, gray)
│  └─────────────┘                 │
│                                  │
│           ┌─────────────┐        │  Self message
│           │ 自分: やっほー │     │  (right-aligned, blue)
│           └─────────────┘        │
│                                  │
├─────────────────────────────────┤
│  会話メッセージ数: 2             │  Footer
└─────────────────────────────────┘
```

### 3. Component: `ExportButton.tsx` (T045)
Location: `/frontend-public/src/components/conversations/ExportButton.tsx`

User-facing export button with integrated functionality.

**Features:**
- Beautiful gradient button (purple to pink)
- Loading spinner during export
- Hidden off-screen ExportableChat for rendering
- Automatic filename generation: `conversation_YYYY-MM-DD.png`
- Error handling with user alerts
- Download icon SVG

**Props:**
```typescript
interface ExportButtonProps {
  conversation: MeetGreetConversation;
  memberImageUrl?: string;
}
```

**Visual States:**
- Normal: "画像ダウンロード" with download icon
- Loading: "ダウンロード中..." with spinner
- Disabled during export

### 4. Index Export: `index.ts`
Location: `/frontend-public/src/components/conversations/index.ts`

Barrel export for clean imports:
```typescript
import { ExportButton, ExportableChat } from '@/components/conversations';
```

## Integration Guide

See `INTEGRATION_EXAMPLE.md` for complete integration examples.

### Quick Integration
```tsx
import { ExportButton } from '@/components/conversations';

function ConversationDetailPage() {
  const { data: conversation } = useQuery(...);
  const memberImageUrl = member?.images.find(img => img.isPrimary)?.url;

  return (
    <div>
      <ExportButton
        conversation={conversation}
        memberImageUrl={memberImageUrl}
      />
      {/* Your chat UI */}
    </div>
  );
}
```

## Technical Details

### Dependencies
- `html2canvas@1.4.1` - HTML to canvas rendering
- `react@18` - UI framework
- `tailwindcss` - Styling

### Export Settings
```typescript
{
  scale: 2,              // 2x resolution for quality
  useCORS: true,         // Allow cross-origin images
  backgroundColor: '#ffffff',  // Clean white background
  logging: false,        // Disable console logs
  windowWidth: element.scrollWidth,
  windowHeight: element.scrollHeight,
}
```

### Image Format
- Format: PNG
- Resolution: 2160px × variable (2x scale from 1080px)
- Color: RGB
- Background: White (#ffffff)

## Design Decisions

1. **Fixed Width (1080px)**: Ensures consistent export size across devices
2. **Off-screen Rendering**: ExportableChat is rendered hidden to avoid UI flicker
3. **Separate Components**: ExportButton handles UX, ExportableChat handles layout
4. **High DPI**: 2x scale for sharp text on high-resolution displays
5. **LINE-style UI**: Familiar chat interface for Japanese users
6. **CORS Enabled**: Allows member images from external URLs

## Testing

TypeScript compilation verified:
```bash
cd frontend-public && npx tsc --noEmit
# ✅ No errors
```

## Future Enhancements

Potential improvements (not in current scope):
- [ ] Custom image quality selection
- [ ] Multiple format support (JPEG, WEBP)
- [ ] Image preview before download
- [ ] Share to social media
- [ ] Watermark option
- [ ] Custom background colors/themes
