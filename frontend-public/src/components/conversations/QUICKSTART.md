# Quick Start Guide: Image Export Feature

## Overview
This feature allows users to export their ミーグリ (Meet & Greet) conversation as a PNG image for sharing or archiving.

## Implementation Status: COMPLETE ✅

### Files Created
1. `/hooks/useExportToImage.ts` - Export hook (T044)
2. `/components/conversations/ExportableChat.tsx` - Export layout component (T043, T046)
3. `/components/conversations/ExportButton.tsx` - User-facing button (T045)
4. `/components/conversations/index.ts` - Barrel exports

### Dependencies
- `html2canvas@1.4.1` - Already installed ✅
- `@types/html2canvas` - Already installed ✅

## Quick Integration (Copy & Paste)

### Step 1: Import the component
```tsx
import { ExportButton } from '@/components/conversations';
```

### Step 2: Add to your ConversationDetailPage
```tsx
function ConversationDetailPage() {
  const { id } = useParams();

  // Fetch conversation
  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationsAPI.getById(id),
  });

  // Fetch member (optional - for image)
  const { data: member } = useQuery({
    queryKey: ['member', conversation?.memberId],
    queryFn: () => membersAPI.getById(conversation!.memberId!),
    enabled: !!conversation?.memberId,
  });

  // Get member's primary image
  const memberImageUrl = member?.images.find(img => img.isPrimary)?.url;

  if (!conversation) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Add export button in header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{conversation.title}</h1>
        <ExportButton
          conversation={conversation}
          memberImageUrl={memberImageUrl}
        />
      </div>

      {/* Your existing conversation UI */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Chat messages */}
      </div>
    </div>
  );
}
```

### Step 3: Done!
The button will:
- Show "画像ダウンロード" with download icon
- Change to "ダウンロード中..." with spinner during export
- Download PNG as `conversation_2024-12-30.png`
- Handle errors with alert messages

## Export Output

### Image Specifications
- **Format**: PNG
- **Size**: 2160px × variable height (2x scale from 1080px)
- **Quality**: High (2x rendering scale)
- **Background**: White (#ffffff)

### Layout
```
┌──────────────────────────────────────┐
│ [Member    ]  会話タイトル            │
│ [Image 80px]  2024-12-30             │
├──────────────────────────────────────┤
│                                       │
│ ┌──────────────────┐                 │
│ │ 相手: メッセージ  │                │ ← Gray bubble, left
│ └──────────────────┘                 │
│                                       │
│              ┌──────────────────┐    │
│              │ 自分: メッセージ  │   │ ← Blue bubble, right
│              └──────────────────┘    │
│                                       │
├──────────────────────────────────────┤
│ 会話メッセージ数: 2                  │
└──────────────────────────────────────┘
```

## Advanced Usage

### Custom Export Hook
If you need more control:

```tsx
import { useRef } from 'react';
import { useExportToImage } from '@/hooks/useExportToImage';
import { ExportableChat } from '@/components/conversations';

function MyComponent() {
  const exportRef = useRef<HTMLDivElement>(null);
  const { exportToImage, isExporting } = useExportToImage();

  const handleExport = async () => {
    if (!exportRef.current) return;

    try {
      await exportToImage(exportRef.current, 'custom-filename.png');
      console.log('Export successful!');
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <>
      <button onClick={handleExport} disabled={isExporting}>
        {isExporting ? 'Exporting...' : 'Export'}
      </button>

      <div style={{ position: 'absolute', left: '-9999px' }}>
        <ExportableChat
          ref={exportRef}
          conversation={myConversation}
          memberImageUrl={imageUrl}
        />
      </div>
    </>
  );
}
```

## Troubleshooting

### Images not loading in export
**Problem**: Member images show as broken in exported PNG

**Solution**: Ensure images have CORS headers. The export uses `useCORS: true` in html2canvas config.

### Export quality is poor
**Problem**: Text appears blurry in exported image

**Solution**: Already handled! We use `scale: 2` for high-quality export (2160px width).

### Export is too slow
**Problem**: Large conversations take long to export

**Solution**: This is expected with html2canvas. Consider:
- Show loading state (already implemented)
- Optimize conversation length
- Consider pagination for very long conversations

### TypeScript errors
**Problem**: Import errors or type mismatches

**Solution**: Run type check:
```bash
cd frontend-public
npx tsc --noEmit
```

All types are correctly defined in `/types/index.ts`.

## Testing

### Manual Testing Checklist
- [ ] Click export button
- [ ] Verify loading spinner appears
- [ ] Verify PNG downloads
- [ ] Open PNG and check quality
- [ ] Verify member image appears (if provided)
- [ ] Verify all messages are present
- [ ] Verify message order is correct
- [ ] Verify date format is correct
- [ ] Test with long messages (word wrap)
- [ ] Test without member image
- [ ] Test with empty conversation
- [ ] Test error handling (network issues)

### Visual Preview
Use the test example file:
```tsx
import { ExportableChatPreview } from '@/components/conversations/ExportableChat.test.example';
```

Add to router and navigate to preview page.

## Support

### Resources
- Full documentation: `README.md`
- Integration examples: `INTEGRATION_EXAMPLE.md`
- Visual testing: `ExportableChat.test.example.tsx`

### Common Issues
1. **Member image not showing**: Check if `memberImageUrl` is valid
2. **Export filename wrong**: Date comes from `conversation.conversationDate`
3. **Styling issues**: ExportableChat uses inline styles for consistency

## Next Steps

Once integrated into ConversationDetailPage:
1. Test with real conversation data
2. Test with different screen sizes (export is always 1080px)
3. Test with Japanese text
4. Test with emoji in messages
5. Gather user feedback
6. Consider adding share to social media
