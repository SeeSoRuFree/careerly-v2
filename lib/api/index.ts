/**
 * API 모듈 통합 Export
 * 외부에서 사용할 수 있는 공개 API를 제공합니다.
 */

// ============================================================
// Clients
// ============================================================
export { publicClient, authClient } from './clients/rest-client';
export { SSEClient, getSSEClient, createSSEClient } from './clients/sse-client';
export type { SSEOptions, SSEEventHandlers } from './clients/sse-client';

// ============================================================
// Services
// ============================================================

// Auth Service
export {
  login,
  logout,
  refreshToken,
  getCurrentUser,
  signup,
  requestPasswordReset,
  resetPassword,
} from './services/auth.service';

// Search Service
export {
  searchCareer,
  advancedSearch,
  getTrendingKeywords,
  getSearchHistory,
  clearSearchHistory,
  searchAutocomplete,
} from './services/search.service';
export type { Citation, SearchResult } from './services/search.service';

// Chat Service (AI Agent)
export {
  sendChatMessage,
  chatSearch,
  checkAgentHealth,
} from './services/chat.service';

// User Service
export {
  getUserProfile,
  getMyProfile,
  updateProfile,
  uploadAvatar,
  searchUsers,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from './services/user.service';

// Discover Service
export {
  getDiscoverFeeds,
  getDiscoverFeed,
  getDiscoverFeedsByCategory,
  getTrendingFeeds,
  getRecommendedFeeds,
  likeFeed,
  unlikeFeed,
  bookmarkFeed,
  unbookmarkFeed,
  getBookmarkedFeeds,
} from './services/discover.service';

// Posts Service
export {
  getPosts,
  getPost,
  createPost,
  updatePost,
  patchPost,
  deletePost,
} from './services/posts.service';

// Comments Service
export {
  getComments,
  getComment,
  createComment,
  updateComment,
  patchComment,
  deleteComment,
} from './services/comments.service';

// Questions Service
export {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  patchQuestion,
  deleteQuestion,
  getQuestionAnswers,
  createQuestionAnswer,
  getAnswers,
  getAnswer,
  createAnswer,
  updateAnswer,
  patchAnswer,
  deleteAnswer,
} from './services/questions.service';

// ============================================================
// React Query Hooks - Queries
// ============================================================

// Search Queries
export {
  useSearch,
  useTrendingKeywords,
  useSearchHistory,
  useSearchAutocomplete,
  searchKeys,
} from './hooks/queries/useSearch';

// User Queries
export {
  useCurrentUser,
  useMyProfile,
  useUserProfile,
  useSearchUsers,
  useFollowers,
  useFollowing,
  userKeys,
} from './hooks/queries/useUser';

// Discover Queries
export {
  useDiscoverFeeds,
  useDiscoverFeed,
  useDiscoverFeedsByCategory,
  useTrendingFeeds,
  useRecommendedFeeds,
  useBookmarkedFeeds,
  discoverKeys,
} from './hooks/queries/useDiscover';

// Comments Queries
export {
  useComments,
  useComment,
  commentKeys,
} from './hooks/queries/useComments';

// Posts Queries
export {
  usePosts,
  usePost,
  postsKeys,
} from './hooks/queries/usePosts';

// Questions Queries
export {
  useQuestions,
  useQuestion,
  useQuestionAnswers,
  useAnswers,
  useAnswer,
  questionKeys,
  answerKeys,
} from './hooks/queries/useQuestions';

// ============================================================
// React Query Hooks - Mutations
// ============================================================

// Auth Mutations
export {
  useLogin,
  useLogout,
  useSignup,
} from './hooks/mutations/useAuthMutations';

// User Mutations
export {
  useUpdateProfile,
  useUploadAvatar,
  useFollowUser,
  useUnfollowUser,
} from './hooks/mutations/useUserMutations';

// Discover Mutations
export {
  useLikeFeed,
  useUnlikeFeed,
  useBookmarkFeed,
  useUnbookmarkFeed,
} from './hooks/mutations/useDiscoverMutations';

// Chat Mutations
export {
  useChatSearch,
  useChatMessage,
} from './hooks/mutations/useChat';
export type { UseChatMutationParams } from './hooks/mutations/useChat';

// Comments Mutations
export {
  useCreateComment,
  useUpdateComment,
  usePatchComment,
  useDeleteComment,
} from './hooks/mutations/useCommentsMutations';

// Posts Mutations
export {
  useCreatePost,
  useUpdatePost,
  usePatchPost,
  useDeletePost,
} from './hooks/mutations/usePostsMutations';

// Questions Mutations
export {
  useCreateQuestion,
  useUpdateQuestion,
  usePatchQuestion,
  useDeleteQuestion,
  useCreateQuestionAnswer,
  useCreateAnswer,
  useUpdateAnswer,
  usePatchAnswer,
  useDeleteAnswer,
} from './hooks/mutations/useQuestionsMutations';

// ============================================================
// Types
// ============================================================
export type {
  // Error Types
  ApiError,
  ErrorResponse,
  ErrorCode,
  ErrorHandlerOptions,

  // REST Types
  ApiResponse,
  PaginatedResponse,
  PaginationParams,
  SearchParams,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  SearchResultItem,
  DiscoverFeed,
  DiscoverFeedResponse,

  // Chat Types
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatCitation,
  HealthResponse,

  // Posts Types
  Post,
  PostListItem,
  PostCreateRequest,
  PostUpdateRequest,
  PaginatedPostResponse,
  PostType,

  // Comments Types
  Comment,
  CommentCreateRequest,
  CommentUpdateRequest,
  PaginatedCommentResponse,

  // Questions Types
  Question,
  QuestionListItem,
  QuestionCreateRequest,
  QuestionUpdateRequest,
  Answer,
  AnswerCreateRequest,
  AnswerUpdateRequest,
  PaginatedQuestionResponse,
  PaginatedAnswerResponse,
} from './types';

// ============================================================
// Auth Utilities (Client)
// ============================================================
export {
  login as loginClient,
  logout as logoutClient,
  refreshToken as refreshTokenClient,
  checkAuth,
  setMemoryToken,
  getMemoryToken,
  clearMemoryToken,
  getAuthToken,
} from './auth/token.client';

// ============================================================
// Auth Utilities (Server) - Server Actions Only
// ============================================================
export {
  setAuthCookies,
  getAuthCookies,
  getAccessToken,
  getRefreshToken,
  clearAuthCookies,
  refreshAccessToken,
  isAuthenticated,
  getAuthHeader,
} from './auth/token.server';

// ============================================================
// Error Handling
// ============================================================
export {
  handleApiError,
  normalizeError,
  isErrorStatus,
  isErrorCode,
  isAuthError,
} from './interceptors/error-handler';
export { ERROR_CODES, ERROR_MESSAGES } from './types/error.types';

// ============================================================
// Configuration
// ============================================================
export { API_CONFIG, validateApiConfig } from './config';
