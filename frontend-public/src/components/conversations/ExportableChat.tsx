import { forwardRef } from 'react';
import type { MeetGreetConversation } from '../../types';

interface ExportableChatProps {
  conversation: MeetGreetConversation;
  partnerName?: string;
}

const ExportableChat = forwardRef<HTMLDivElement, ExportableChatProps>(
  ({ conversation, partnerName }, ref) => {
    const sortedMessages = [...conversation.messages].sort(
      (a, b) => a.order - b.order
    );

    const displayPartnerName = partnerName || conversation.memberName || '相手';

    return (
      <div
        ref={ref}
        style={{
          width: '400px',
          background: 'linear-gradient(135deg, #f3e8ff 0%, #e9d5ff 30%, #ddd6fe 60%, #ede9fe 100%)',
          padding: '16px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#581c87', marginBottom: '4px' }}>
          {conversation.title}
        </div>
        <div style={{ fontSize: '12px', color: '#7c3aed', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
          {displayPartnerName}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            {sortedMessages.map((message, index) => {
              const isSelf = message.speakerType === 'Self';
              return (
                <tr key={message.id || index}>
                  <td style={{ padding: '0 0 12px 0', verticalAlign: 'top' }}>
                    <table style={{ width: '100%' }}>
                      <tbody>
                        <tr>
                          <td style={{
                            textAlign: isSelf ? 'right' : 'left',
                            fontSize: '10px',
                            color: '#6b21a8',
                            paddingBottom: '4px',
                          }}>
                            {isSelf ? '自分' : displayPartnerName}
                          </td>
                        </tr>
                        <tr>
                          <td style={{ textAlign: isSelf ? 'right' : 'left' }}>
                            <table style={{
                              display: 'inline-table',
                              backgroundColor: isSelf ? '#7e1083' : 'rgba(255,255,255,0.9)',
                              borderRadius: '12px',
                              maxWidth: '70%',
                            }}>
                              <tbody>
                                <tr>
                                  <td style={{
                                    padding: '8px 12px',
                                    fontSize: '13px',
                                    color: isSelf ? '#fff' : '#581c87',
                                    textAlign: 'left',
                                  }}>
                                    {message.content}
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div style={{ fontSize: '10px', color: '#6b21a8', textAlign: 'center', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.5)' }}>
          {sortedMessages.length}件
        </div>
      </div>
    );
  }
);

ExportableChat.displayName = 'ExportableChat';

export default ExportableChat;
