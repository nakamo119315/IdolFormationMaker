import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversations';
import { membersApi } from '../api/members';
import { ChatBubble } from '../components/conversations/ChatBubble';
import { ChatInput } from '../components/conversations/ChatInput';
import ExportButton from '../components/conversations/ExportButton';
import { Loading } from '../components/common/Loading';
import type { CreateMessageDto, SpeakerType, MeetGreetConversation, Member } from '../types';

interface ConversationFormProps {
  conversation: MeetGreetConversation | undefined;
  members: Member[] | undefined;
  isNewMode: boolean;
  id: string | undefined;
}

function ConversationForm({ conversation, members, isNewMode, id }: ConversationFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMount = useRef(true);
  const autoSaveRef = useRef<() => void>(() => {});

  const initialMessages: CreateMessageDto[] = useMemo(
    () =>
      conversation?.messages.map((msg) => ({
        speakerType: msg.speakerType,
        content: msg.content,
        order: msg.order,
      })) ?? [],
    [conversation]
  );

  const [title, setTitle] = useState(conversation?.title ?? '');
  const [selectedMemberId, setSelectedMemberId] = useState<string>(conversation?.memberId ?? '');
  const [conversationDate, setConversationDate] = useState<string>(
    conversation?.conversationDate ?? new Date().toISOString().split('T')[0]
  );
  const [messages, setMessages] = useState<CreateMessageDto[]>(initialMessages);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(!isNewMode);

  // Get selected member's name
  const selectedMemberName = members?.find((m) => m.id === selectedMemberId)?.name ?? '相手';

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (dto: Parameters<typeof conversationsApi.create>[0]) => {
      console.log('createMutation called with:', dto);
      return conversationsApi.create(dto);
    },
    onSuccess: (data) => {
      console.log('createMutation success:', data);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      setIsSaved(true);
      navigate(`/conversations/${data.id}`, { replace: true });
    },
    onError: (error) => {
      console.error('createMutation error:', error);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; title: string; memberId: string | null; conversationDate: string | null; messages: CreateMessageDto[] }) => {
      console.log('updateMutation called with:', data);
      return conversationsApi.update(data.id, { title: data.title, memberId: data.memberId, conversationDate: data.conversationDate, messages: data.messages });
    },
    onSuccess: (result) => {
      console.log('updateMutation success:', result);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['conversation', id] });
      setIsSaved(true);
    },
    onError: (error) => {
      console.error('updateMutation error:', error);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => conversationsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      navigate('/conversations');
    },
  });

  const generateAutoTitle = useCallback(() => {
    const memberName = selectedMemberName !== '相手' ? selectedMemberName : 'メンバー';
    const date = new Date().toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `${memberName}との会話 - ${date}`;
  }, [selectedMemberName]);

  // Auto-save function
  const autoSave = useCallback(() => {
    console.log('autoSave called:', { messagesLength: messages.length, isNewMode, isSaved, id, selectedMemberId, conversationDate });
    if (messages.length === 0) {
      console.log('autoSave: skipped because no messages');
      return;
    }

    const finalTitle = title.trim() || generateAutoTitle();

    if (isNewMode && !isSaved) {
      console.log('autoSave: creating new conversation');
      createMutation.mutate({
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages,
      });
    } else if (!isNewMode && id) {
      console.log('autoSave: updating existing conversation');
      updateMutation.mutate({
        id,
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages,
      });
    } else {
      console.log('autoSave: no action taken');
    }
  }, [messages, title, isNewMode, isSaved, id, selectedMemberId, conversationDate, generateAutoTitle, createMutation, updateMutation]);

  // Keep autoSaveRef updated with the latest autoSave function
  useEffect(() => {
    autoSaveRef.current = autoSave;
  }, [autoSave]);

  // Debounced auto-save for field changes
  const scheduleAutoSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(() => {
      if (!isNewMode && id && messages.length > 0) {
        autoSaveRef.current();  // Use ref to get latest autoSave function
      }
    }, 1000);
  }, [isNewMode, id, messages.length]);

  // Auto-save when member or date changes (after initial mount)
  useEffect(() => {
    console.log('useEffect triggered:', { isInitialMount: isInitialMount.current, selectedMemberId, conversationDate });
    if (isInitialMount.current) {
      console.log('Skipping initial mount');
      isInitialMount.current = false;
      return;
    }
    console.log('Member/Date changed:', { selectedMemberId, conversationDate, isNewMode, id, messagesLength: messages.length });
    if (!isNewMode && id && messages.length > 0) {
      console.log('Scheduling autoSave...');
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        console.log('Triggering autoSave');
        autoSaveRef.current();
      }, 500);
    } else {
      console.log('Conditions not met:', { isNewMode, id, messagesLength: messages.length });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMemberId, conversationDate]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    scheduleAutoSave();
  };

  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMemberId(e.target.value);
    // Auto-save is triggered by useEffect when selectedMemberId changes
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConversationDate(e.target.value);
    // Auto-save is triggered by useEffect when conversationDate changes
  };

  const handleAddMessage = (message: { speakerType: SpeakerType; content: string }) => {
    const newMessage: CreateMessageDto = {
      speakerType: message.speakerType,
      content: message.content,
      order: messages.length + 1,
    };
    const newMessages = [...messages, newMessage];
    setMessages(newMessages);

    // Auto-save after adding message
    const finalTitle = title.trim() || generateAutoTitle();
    if (isNewMode && !isSaved) {
      createMutation.mutate({
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages: newMessages,
      });
    } else if (!isNewMode && id) {
      updateMutation.mutate({
        id,
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages: newMessages,
      });
    }
  };

  const handleEditMessage = (index: number, newContent: string) => {
    const newMessages = messages.map((msg, i) =>
      i === index ? { ...msg, content: newContent } : msg
    );
    setMessages(newMessages);

    // Auto-save after editing
    if (!isNewMode && id) {
      const finalTitle = title.trim() || generateAutoTitle();
      updateMutation.mutate({
        id,
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages: newMessages,
      });
    }
  };

  const handleDeleteMessage = (index: number) => {
    const newMessages = messages
      .filter((_, i) => i !== index)
      .map((msg, i) => ({ ...msg, order: i + 1 }));
    setMessages(newMessages);

    // Auto-save after deleting
    if (!isNewMode && id && newMessages.length > 0) {
      const finalTitle = title.trim() || generateAutoTitle();
      updateMutation.mutate({
        id,
        title: finalTitle,
        memberId: selectedMemberId || null,
        conversationDate,
        messages: newMessages,
      });
    }
  };

  const handleDelete = () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    deleteMutation.mutate();
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const saveError = createMutation.error || updateMutation.error;

  // Build conversation object for export with current state
  const currentConversation: MeetGreetConversation = conversation
    ? {
        ...conversation,
        title: title || conversation.title,
        memberId: selectedMemberId || null,
        memberName: selectedMemberName !== '相手' ? selectedMemberName : null,
        messages: messages.map((msg, i) => ({
          id: `msg-${i}`,
          speakerType: msg.speakerType,
          content: msg.content,
          order: msg.order,
          createdAt: new Date().toISOString(),
        })),
      }
    : {
        id: 'new',
        title: title || generateAutoTitle(),
        memberId: selectedMemberId || null,
        memberName: selectedMemberName !== '相手' ? selectedMemberName : null,
        conversationDate: new Date().toISOString(),
        messages: messages.map((msg, i) => ({
          id: `msg-${i}`,
          speakerType: msg.speakerType,
          content: msg.content,
          order: msg.order,
          createdAt: new Date().toISOString(),
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-[calc(100vh-7rem)] flex flex-col">
        {/* Header - compact */}
        <div className="flex items-center justify-between mb-2">
          <Link
            to="/conversations"
            className="inline-flex items-center text-slate-500 hover:text-blue-600 transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            戻る
          </Link>
          {isSaving && (
            <span className="text-sm text-slate-500 flex items-center gap-1">
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              保存中...
            </span>
          )}
          {saveError && (
            <span className="text-sm text-red-500">
              保存エラー: {saveError.message}
            </span>
          )}
        </div>

        {/* Form controls */}
        <div className="mb-2 space-y-2">
          {/* Member selector */}
          <div className="flex items-center gap-3">
            <label htmlFor="member" className="text-sm font-medium text-slate-700 w-20 flex-shrink-0">
              メンバー:
            </label>
            <select
              id="member"
              value={selectedMemberId}
              onChange={handleMemberChange}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">選択してください（任意）</option>
              {members?.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date input */}
          <div className="flex items-center gap-3">
            <label htmlFor="date" className="text-sm font-medium text-slate-700 w-20 flex-shrink-0">
              日付:
            </label>
            <input
              id="date"
              type="date"
              value={conversationDate}
              onChange={handleDateChange}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Title input */}
          <div className="flex items-center gap-3">
            <label htmlFor="title" className="text-sm font-medium text-slate-700 w-20 flex-shrink-0">
              タイトル:
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="タイトルを入力（空欄の場合は自動生成）"
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              maxLength={100}
            />
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-xl shadow-lg overflow-hidden flex flex-col min-h-0">
          {/* Messages container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-2"
          >
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-slate-400">メッセージを入力してください</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <ChatBubble
                  key={index}
                  message={{
                    id: `temp-${index}`,
                    ...msg,
                    createdAt: new Date().toISOString(),
                  }}
                  isOwn={msg.speakerType === 'Self'}
                  partnerName={selectedMemberName}
                  onEdit={(newContent: string) => handleEditMessage(index, newContent)}
                  onDelete={() => handleDeleteMessage(index)}
                />
              ))
            )}
          </div>

          {/* Chat input with action buttons */}
          <div className="border-t border-slate-200">
            <ChatInput onSend={handleAddMessage} disabled={isSaving || isDeleting} />
            <div className="flex gap-2 justify-end px-4 pb-2">
              {messages.length > 0 && (
                <ExportButton
                  conversation={currentConversation}
                  partnerName={selectedMemberName !== '相手' ? selectedMemberName : undefined}
                />
              )}
              {!isNewMode && (
                <button
                  onClick={handleDelete}
                  disabled={isDeleting || isSaving}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    showDeleteConfirm
                      ? 'bg-red-500 text-white hover:bg-red-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isDeleting ? '削除中...' : showDeleteConfirm ? '本当に削除？' : '削除'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isNewMode = id === 'new';

  const { data: conversation, isLoading } = useQuery({
    queryKey: ['conversation', id],
    queryFn: () => conversationsApi.getById(id!),
    enabled: !isNewMode,
  });

  const { data: members } = useQuery({
    queryKey: ['members'],
    queryFn: membersApi.getAll,
  });

  if (!isNewMode && isLoading) {
    return <Loading />;
  }

  if (!isNewMode && !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-slate-500 mb-4">会話記録が見つかりません</p>
          <Link to="/conversations" className="text-blue-500 hover:underline">
            会話記録一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ConversationForm
      key={id}
      conversation={conversation}
      members={members}
      isNewMode={isNewMode}
      id={id}
    />
  );
}
