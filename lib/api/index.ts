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
export { somoonClient } from './clients/somoon-client';

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
  verifyPasswordReset,
  initiateOAuthLogin,
  handleOAuthCallback,
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
  streamChatMessage,
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
  getMySavedPosts,
  getRecommendedFollowers,
  checkFollowStatus,
} from './services/user.service';
export type { RecommendedFollower, FollowStatus } from './services/user.service';

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
  getFollowingPosts,
  getPopularPosts,
  getTopPosts,
  getRecommendedPosts,
  createPost,
  updatePost,
  patchPost,
  deletePost,
  likePost,
  unlikePost,
  isPostLiked,
  savePost,
  unsavePost,
  isPostSaved,
  viewPost,
  repostPost,
  unrepostPost,
} from './services/posts.service';
export type { TopPostsPeriod, GetPostsParams } from './services/posts.service';

// Comments Service
export {
  getComments,
  getComment,
  createComment,
  updateComment,
  patchComment,
  deleteComment,
  likeComment,
  unlikeComment,
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
  acceptAnswer,
} from './services/questions.service';
export type { GetQuestionsParams } from './services/questions.service';

// Contents Service (Somoon)
export { getDailyContents } from './services/contents.service';

// Jobs Service (Somoon)
export { getDailyJobs } from './services/jobs.service';

// Profile Service
export {
  getProfileById,
  getProfileByUserId,
  getMyProfileDetail,
  updateMyProfile,
  addCareer,
  updateCareer,
  deleteCareer,
  addEducation,
  updateEducation,
  deleteEducation,
  searchSkills,
  replaceProfileSkills,
} from './services/profile.service';
export type { Skill, ReplaceSkillsRequest, ReplaceSkillsResponse } from './services/profile.service';

// Settings Service
export {
  getUserSettings,
  updateUserSettings,
  changePassword,
  getInterests,
  getUserInterests,
  updateUserInterests,
  requestDeleteAccount,
} from './services/settings.service';
export type {
  UserSettings,
  ChangePasswordRequest,
  Interest,
  DeleteAccountRequest,
  DeleteAccountResponse,
} from './services/settings.service';

// Report Service
export { reportContent } from './services/report.service';
export { CONTENT_TYPE } from './types/report.types';

// Block Service
export {
  blockUser,
  unblockUser,
  isUserBlocked,
  getBlockedUsers,
} from './services/block.service';

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
  useFollowStatus,
  useMySavedPosts,
  useInfiniteMySavedPosts,
  useMyPosts,
  useInfiniteMyPosts,
  useMyQuestions,
  useInfiniteMyQuestions,
  useRecommendedFollowers,
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
  useFollowingPosts,
  useInfinitePosts,
  usePopularPosts,
  useTopPosts,
  useRecommendedPosts,
  usePostLikeStatus,
  usePostSaveStatus,
  postsKeys,
} from './hooks/queries/usePosts';

// Questions Queries
export {
  useQuestions,
  useQuestion,
  useInfiniteQuestions,
  useQuestionAnswers,
  useAnswers,
  useAnswer,
  questionKeys,
  answerKeys,
} from './hooks/queries/useQuestions';

// Contents Queries (Somoon)
export {
  useDailyContents,
  useInfiniteDailyContents,
  contentsKeys,
} from './hooks/queries/useContents';

// Jobs Queries (Somoon)
export {
  useDailyJobs,
  useInfiniteDailyJobs,
  jobsKeys,
} from './hooks/queries/useJobs';

// Profile Queries
export {
  useProfileById,
  useProfileByUserId,
  useMyProfileDetail,
  profileKeys,
} from './hooks/queries/useProfile';

// Settings Queries
export {
  useUserSettings,
  useInterests,
  useUserInterests,
  settingsKeys,
} from './hooks/queries/useSettings';

// Block Queries
export {
  useIsUserBlocked,
  useBlockedUsers,
  blockKeys,
} from './hooks/queries/useBlock';

// ============================================================
// React Query Hooks - Mutations
// ============================================================

// Auth Mutations
export {
  useLogin,
  useLogout,
  useSignup,
  useOAuthLogin,
  useOAuthCallback,
  useRequestPasswordReset,
  useVerifyPasswordReset,
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
  useChatSearchAllVersions,
} from './hooks/mutations/useChat';
export type { UseChatMutationParams, UseChatSearchAllVersionsParams } from './hooks/mutations/useChat';

// Comments Mutations
export {
  useCreateComment,
  useUpdateComment,
  usePatchComment,
  useDeleteComment,
  useLikeComment,
  useUnlikeComment,
} from './hooks/mutations/useCommentsMutations';

// Posts Mutations
export {
  useCreatePost,
  useUpdatePost,
  usePatchPost,
  useDeletePost,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
  useViewPost,
  useRepostPost,
  useUnrepostPost,
  useUploadPostImage,
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
  useAcceptAnswer,
  useLikeQuestion,
  useUnlikeQuestion,
  useLikeAnswer,
  useUnlikeAnswer,
  useUploadQuestionImage,
  useUploadAnswerImage,
} from './hooks/mutations/useQuestionsMutations';

// Profile Mutations
export {
  useUpdateMyProfile,
  useUploadProfileImage,
  useAddCareer,
  useUpdateCareer,
  useDeleteCareer,
  useAddEducation,
  useUpdateEducation,
  useDeleteEducation,
  useReplaceProfileSkills,
} from './hooks/mutations/useProfileMutations';

// Settings Mutations
export {
  useUpdateUserSettings,
  useChangePassword,
  useUpdateUserInterests,
  useRequestDeleteAccount,
} from './hooks/mutations/useSettingsMutations';

// Report Mutations
export { useReportContent } from './hooks/mutations/useReportMutations';

// Block Mutations
export {
  useBlockUser,
  useUnblockUser,
} from './hooks/mutations/useBlockMutations';

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
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordResetVerifyRequest,
  OAuthProvider,
  OAuthLoginResponse,
  OAuthCallbackRequest,
  User,
  SearchResultItem,
  DiscoverFeed,
  DiscoverFeedResponse,

  // Chat Types
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatCitation,
  ChatComparisonResult,
  ChatSources,
  ApiVersion,

  // SSE Types
  SSEEventType,
  SSEStatusStep,
  SSEStatusEvent,
  SSETokenEvent,
  SSESourcesEvent,
  SSECompleteEvent,
  SSEErrorEvent,
  SSEAgentProgressEvent,
  AgentProgressType,
  AgentProgressStatus,
  StreamCallbacks,

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

  // Profile Types
  ProfileDetail,
  ProfileSummary,
  ProfileUpdateRequest,
  Career,
  CareerRequest,
  Education,
  EducationRequest,
  ProfileSkill,
  ProfileSite,
  CareerDuration,

  // Report Types
  ReportRequest,
  ReportResponse,
  ContentType,

  // Block Types
  BlockResponse,
  UnblockResponse,
  IsBlockedResponse,
  BlockedUser,
  PaginatedBlockedUsersResponse,
} from './types';

// Somoon Types
export type {
  SomoonContentType,
  SomoonAdditionalInfo,
  SomoonAnalysisJson,
  SomoonAnalysis,
  SomoonCompanyInfo,
  SomoonDailyContent,
  SomoonPaginatedResponse,
  GetDailyContentsParams,
  SomoonJobItem,
  GetDailyJobsParams,
} from './types/somoon.types';

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
// NOTE: token.server.ts exports are NOT included here to prevent
// 'next/headers' from being bundled in client-side code.
// API routes should use NextRequest.cookies and NextResponse.cookies directly.

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
