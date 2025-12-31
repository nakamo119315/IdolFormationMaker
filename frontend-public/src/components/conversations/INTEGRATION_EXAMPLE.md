# Integration Example for Export Feature

## How to use in ConversationDetailPage

```tsx
import { ExportButton } from '../../components/conversations';
import { Member } from '../../types';

// In your ConversationDetailPage component:
function ConversationDetailPage() {
  const { id } = useParams();
  const { data: conversation } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => api.getConversation(id),
  });

  // Optionally fetch member data to get the image
  const { data: member } = useQuery({
    queryKey: ['member', conversation?.memberId],
    queryFn: () => api.getMember(conversation!.memberId!),
    enabled: !!conversation?.memberId,
  });

  // Get the primary image URL
  const memberImageUrl = member?.images.find((img) => img.isPrimary)?.url;

  if (!conversation) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      {/* Header with export button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{conversation.title}</h1>
        <ExportButton
          conversation={conversation}
          memberImageUrl={memberImageUrl}
        />
      </div>

      {/* Rest of your conversation display */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {/* Your existing chat UI */}
      </div>
    </div>
  );
}
```

## Component Props

### ExportButton
```typescript
interface ExportButtonProps {
  conversation: MeetGreetConversation;  // Required
  memberImageUrl?: string;              // Optional - member's image URL
}
```

### ExportableChat (Advanced Usage)
```typescript
interface ExportableChatProps {
  conversation: MeetGreetConversation;
  memberImageUrl?: string;
}

// Direct usage with ref
const exportRef = useRef<HTMLDivElement>(null);
<ExportableChat
  ref={exportRef}
  conversation={conversation}
  memberImageUrl={memberImageUrl}
/>
```

## Features

1. **Automatic filename**: Generated as `conversation_YYYY-MM-DD.png` based on conversation date
2. **Member image**: Displayed in header if provided (circular with purple border)
3. **Clean layout**:
   - 1080px width for consistent exports
   - High-quality 2x scale rendering
   - White background
   - Readable fonts and spacing
4. **Loading state**: Shows spinner and "ダウンロード中..." text during export
5. **Error handling**: Shows alert if export fails

## Styling Notes

The exported image uses:
- Fixed 1080px width
- 40px padding
- Blue bubbles for "Self" messages (right-aligned)
- Gray bubbles for "Partner" messages (left-aligned)
- Member image as 80x80px circle
- Clean typography with system fonts
