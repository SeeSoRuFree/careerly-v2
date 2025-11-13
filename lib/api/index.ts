/**
 * API 모듈 통합 Export
 * 외부에서 사용할 수 있는 공개 API를 제공합니다.
 */

// ============================================================
// Clients
// ============================================================
export { publicClient, authClient } from './clients/rest-client';
export { graphqlClient, graphqlRequest, graphqlMutation } from './clients/graphql-client';
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
  searchCareerGraphQL,
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

// ============================================================
// React Query Hooks - Queries
// ============================================================

// Search Queries
export {
  useSearch,
  useSearchGraphQL,
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

// GraphQL Hooks
export { useGraphQL, useGraphQLMutation } from './hooks/useGraphQL';

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
  RefreshTokenRequest,
  RefreshTokenResponse,
  User,
  SearchResultItem,
  DiscoverFeed,
  DiscoverFeedResponse,

  // GraphQL Types
  GraphQLQueryOptions,
  GraphQLError,
  GraphQLResponse,
  SearchQueryVariables,
  SearchQueryResult,
  UserQueryVariables,
  UserQueryResult,

  // Chat Types
  ChatRequest,
  ChatResponse,
  ChatSearchResult,
  ChatCitation,
  HealthResponse,
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
