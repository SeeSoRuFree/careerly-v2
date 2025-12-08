'use client';

import * as React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  X,
  ImagePlus,
  Link2,
  ChevronLeft,
  AlertCircle,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Code,
  Plus,
  Loader2
} from 'lucide-react';
import { useCurrentUser, usePost, useUpdatePost, useUploadPostImage } from '@/lib/api';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { useStore } from '@/hooks/useStore';
import { toast } from 'sonner';

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = Number(params.postId);

  const [title, setTitle] = React.useState('');
  const [showTitle, setShowTitle] = React.useState(false);
  const [isInitialized, setIsInitialized] = React.useState(false);

  const { data: post, isLoading: isPostLoading } = usePost(postId);
  const updatePostMutation = useUpdatePost();
  const uploadImageMutation = useUploadPostImage();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // User authentication
  const { data: user, isLoading: isUserLoading } = useCurrentUser();
  const { openLoginModal } = useStore();

  // Tiptap editor setup
  const editor = useEditor({
    immediatelyRender: false,
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
        placeholder: '나누고 싶은 생각이나 이야기를 자유롭게 적어보세요.',
      }),
    ],
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-4 py-3',
      },
    },
  });

  // Redirect to community and show login modal if not authenticated
  React.useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/community');
      openLoginModal();
    }
  }, [user, isUserLoading, router, openLoginModal]);

  // Check if user owns this post
  React.useEffect(() => {
    if (post && user && post.userid !== user.id) {
      toast.error('본인의 글만 수정할 수 있습니다.');
      router.push('/community');
    }
  }, [post, user, router]);

  // Initialize form with post data
  React.useEffect(() => {
    if (post && editor && !isInitialized) {
      if (post.title) {
        setTitle(post.title);
        setShowTitle(true);
      }
      editor.commands.setContent(post.descriptionhtml || post.description || '');
      setIsInitialized(true);
    }
  }, [post, editor, isInitialized]);

  const MIN_CONTENT_LENGTH = 20;

  const handleCancel = () => {
    if (confirm('수정을 취소하시겠습니까? 변경사항이 저장되지 않습니다.')) {
      router.push('/community');
    }
  };

  const handleSubmit = async () => {
    if (!editor) return;

    const contentLength = editor.getText().trim().length;
    if (contentLength < MIN_CONTENT_LENGTH) {
      toast.error(`내용을 ${MIN_CONTENT_LENGTH}자 이상 입력해주세요. (현재 ${contentLength}자)`);
      return;
    }

    try {
      await updatePostMutation.mutateAsync({
        id: postId,
        data: {
          title: title || undefined,
          description: editor.getText(),
          descriptionhtml: editor.getHTML(),
        },
      });

      toast.success('글이 수정되었습니다.');
      router.push('/community');
    } catch (error) {
      console.error('Failed to update post:', error);
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

    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드할 수 있습니다');
      return;
    }

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
      console.error('Failed to upload image:', error);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Show loading while checking authentication or loading post
  if (isUserLoading || isPostLoading) {
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
      {/* Top Navigation Bar */}
      <header className="w-full bg-slate-50 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleCancel} className="-ml-2 hover:bg-slate-200">
              <ChevronLeft className="h-6 w-6 text-slate-900" />
            </Button>
            <span className="font-semibold text-slate-900">글 수정</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="coral"
              size="sm"
              onClick={handleSubmit}
              disabled={updatePostMutation.isPending}
              className="px-6 font-semibold"
            >
              {updatePostMutation.isPending ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Main Editor Area */}
        <main className="lg:col-span-8 space-y-8">
          <div className="min-h-[600px]">
            <div className="space-y-6">
              {/* Title Toggle Button - Only show when title is hidden */}
              {!showTitle && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 mx-auto flex items-center gap-1.5 text-xs"
                  onClick={() => setShowTitle(true)}
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>제목 추가</span>
                </Button>
              )}

              {/* Title Input with Close Button */}
              {showTitle && (
                <div className="relative">
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="제목을 입력하세요"
                    className="text-xl font-bold border-2 border-transparent hover:border-slate-200 focus-visible:border-slate-300 px-4 py-3 pr-10 shadow-none focus-visible:ring-0 placeholder:text-slate-300 h-auto bg-transparent rounded-lg transition-colors"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded"
                    onClick={() => {
                      setShowTitle(false);
                      setTitle('');
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

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
          {updatePostMutation.isError && (
            <div className="bg-red-50 border border-red-100 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">글 수정 실패</p>
                <p className="text-sm text-red-700 mt-1">
                  {updatePostMutation.error instanceof Error
                    ? updatePostMutation.error.message
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
