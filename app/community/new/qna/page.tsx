'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  ChevronLeft,
  AlertCircle,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Link2,
  ImagePlus,
  Loader2
} from 'lucide-react';
import { useCurrentUser, useCreateQuestion, useUploadPostImage } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';

const DRAFT_KEY = 'careerly_draft_qna';

interface DraftData {
  title: string;
  content: string;
  savedAt: string;
}

export default function NewQnaPage() {
  const router = useRouter();
  const [title, setTitle] = React.useState('');
  const [isSaved, setIsSaved] = React.useState(false);
  const createQuestionMutation = useCreateQuestion();
  const uploadImageMutation = useUploadPostImage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // User authentication
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { openLoginModal } = useStore();

  // Redirect to community and show login modal if not authenticated
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/community?tab=qna');
      openLoginModal();
    }
  }, [user, isUserLoading, router, openLoginModal]);

  // Tiptap editor setup
  const editor = useEditor({
    immediatelyRender: false, // SSR support for Next.js
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg',
        },
      }),
      Placeholder.configure({
        placeholder: '질문 내용을 자세히 작성해주세요. 구체적인 상황, 시도해본 것, 관련 코드나 에러를 포함하면 좋습니다.',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Draft functions
  const saveDraft = React.useCallback((silent = false) => {
    if (!editor) return;

    const draft: DraftData = {
      title,
      content: editor.getHTML(),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

    if (!silent) {
      toast.success('임시저장되었습니다');
    }

    setIsSaved(true);
  }, [title, editor]);

  const loadDraft = React.useCallback((): DraftData | null => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return null;
  }, []);

  const clearDraft = React.useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
  }, []);

  // Track content changes to reset isSaved state
  React.useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      setIsSaved(false);
    };

    editor.on('update', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
    };
  }, [editor]);

  // Track title changes to reset isSaved state
  React.useEffect(() => {
    setIsSaved(false);
  }, [title]);

  // Auto-save every 3 seconds
  React.useEffect(() => {
    if (!editor) return;

    const interval = setInterval(() => {
      const editorText = editor.getText().trim();
      if (title || editorText) {
        saveDraft(true); // Silent save
      }
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [title, editor, saveDraft]);

  // Load draft on mount (when editor is ready)
  React.useEffect(() => {
    if (!editor) return;

    const draft = loadDraft();
    if (draft && (draft.title || draft.content)) {
      if (confirm('이전에 작성 중이던 질문이 있습니다. 불러오시겠습니까?')) {
        setTitle(draft.title || '');
        editor.commands.setContent(draft.content || '');
      }
    }
  }, [editor, loadDraft]);

  const MIN_CONTENT_LENGTH = 20;

  const handleCancel = () => {
    const editorText = editor?.getText().trim() || '';

    // If saved, navigate without warning
    if (isSaved) {
      router.push('/community?tab=qna');
      return;
    }

    // If has content and not saved, show warning
    if (title.trim().length > 0 || editorText.length > 0) {
      if (confirm('작성 중인 내용이 있습니다. 정말 나가시겠습니까?')) {
        router.push('/community?tab=qna');
      }
    } else {
      router.push('/community?tab=qna');
    }
  };

  const handleSubmit = async () => {
    if (!editor) return;

    // 제목 필수 체크
    if (!title.trim()) {
      toast.error('제목을 입력해주세요');
      return;
    }

    const contentLength = editor.getText().trim().length;
    if (contentLength < MIN_CONTENT_LENGTH) {
      toast.error(`내용을 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요. (현재 ${contentLength}자)`);
      return;
    }

    try {
      await createQuestionMutation.mutateAsync({
        title: title.trim(),
        description: editor.getText(),
        descriptionhtml: editor.getHTML(),
        ispublic: 1,
      });

      // Clear draft on successful post
      clearDraft();

      // Success - redirect to community Q&A tab
      router.push('/community?tab=qna');
    } catch (error) {
      console.error('Failed to create question:', error);
    }
  };

  const handleBold = () => editor?.chain().focus().toggleBold().run();
  const handleItalic = () => editor?.chain().focus().toggleItalic().run();
  const handleStrike = () => editor?.chain().focus().toggleStrike().run();
  const handleBulletList = () => editor?.chain().focus().toggleBulletList().run();
  const handleOrderedList = () => editor?.chain().focus().toggleOrderedList().run();
  const handleCode = () => editor?.chain().focus().toggleCodeBlock().run();

  const handleLink = () => {
    const url = window.prompt('URL을 입력하세요');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  };

  const handleImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

    // Validate file size (max 10MB to match backend limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('이미지 크기는 10MB 이하여야 합니다');
      return;
    }

    try {
      const result = await uploadImageMutation.mutateAsync(file);
      if (result.image_url) {
        editor?.chain().focus().setImage({ src: result.image_url }).run();
      }
    } catch (error) {
      // Error toast is handled by the mutation hook
      console.error('Failed to upload image:', error);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show loading while checking authentication
  if (isUserLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  // Don't render if not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Navigation Bar - Full Width, Seamless */}
      <header className="w-full bg-slate-50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel} className="-ml-2 hover:bg-slate-200">
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">질문하기</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-500 hover:bg-slate-200"
              onClick={() => saveDraft(false)}
            >
              임시저장
            </Button>
            <Button
              variant="coral"
              size="sm"
              onClick={handleSubmit}
              disabled={createQuestionMutation.isPending}
              className="px-6 font-semibold"
            >
              {createQuestionMutation.isPending ? '등록 중...' : '등록'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Editor Area */}
        <main className="lg:col-span-8 space-y-8">
          {/* Editor - No Card */}
          <div className="min-h-[600px]">
            <div className="space-y-6">
              {/* Title Input - Always visible and required for Q&A */}
              <div className="relative">
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="질문을 한 줄로 요약해주세요 (필수)"
                  className="text-xl font-bold border-2 border-transparent hover:border-slate-200 focus-visible:border-slate-300 px-4 py-3 shadow-none focus-visible:ring-0 placeholder:text-slate-300 h-auto bg-transparent rounded-lg transition-colors"
                />
              </div>

              {/* Editor Toolbar */}
              <div className="flex items-center gap-1 px-2 py-2 border-b border-slate-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('bold') ? 'bg-slate-100' : ''}`}
                  title="Bold"
                  onClick={handleBold}
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('italic') ? 'bg-slate-100' : ''}`}
                  title="Italic"
                  onClick={handleItalic}
                >
                  <Italic className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('strike') ? 'bg-slate-100' : ''}`}
                  title="Strikethrough"
                  onClick={handleStrike}
                >
                  <Strikethrough className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('bulletList') ? 'bg-slate-100' : ''}`}
                  title="Bullet List"
                  onClick={handleBulletList}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('orderedList') ? 'bg-slate-100' : ''}`}
                  title="Numbered List"
                  onClick={handleOrderedList}
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-6 bg-slate-200 mx-1" />

                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('codeBlock') ? 'bg-slate-100' : ''}`}
                  title="Code Block"
                  onClick={handleCode}
                >
                  <Code className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900 ${editor?.isActive('link') ? 'bg-slate-100' : ''}`}
                  title="Link"
                  onClick={handleLink}
                >
                  <Link2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  title="Image"
                  onClick={handleImage}
                  disabled={uploadImageMutation.isPending}
                >
                  {uploadImageMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Content Editor */}
              <div className="min-h-[400px] border-2 border-transparent hover:border-slate-200 focus-within:border-slate-300 rounded-lg transition-colors">
                <EditorContent editor={editor} />
              </div>

              {/* Hidden file input for image upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>

          {/* Error Message */}
          {createQuestionMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">질문 등록 실패</p>
                <p className="text-sm text-red-700 mt-1">
                  {createQuestionMutation.error instanceof Error
                    ? createQuestionMutation.error.message
                    : '알 수 없는 오류가 발생했습니다. 다시 시도해주세요.'}
                </p>
              </div>
            </div>
          )}
        </main>

        {/* Sidebar */}
        <aside className="hidden lg:block lg:col-span-4 space-y-8">
          <div className="sticky top-24 space-y-6">
            {/* User Profile */}
            <div className="flex items-center gap-4 px-2">
              <Avatar className="h-12 w-12 border border-slate-200">
                <AvatarImage src={user.image_url} alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-bold text-slate-900">{user.name}</p>
                {user.headline && (
                  <p className="text-sm text-slate-500">{user.headline}</p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
