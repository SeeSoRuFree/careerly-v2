/**
 * GraphQL API 타입 정의
 */

/**
 * GraphQL 쿼리 옵션
 */
export interface GraphQLQueryOptions {
  variables?: Record<string, unknown>;
  headers?: Record<string, string>;
}

/**
 * GraphQL 에러
 */
export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
  extensions?: {
    code?: string;
    [key: string]: unknown;
  };
}

/**
 * GraphQL 응답
 */
export interface GraphQLResponse<T = unknown> {
  data?: T;
  errors?: GraphQLError[];
}

/**
 * 예시: 검색 쿼리 타입
 */
export interface SearchQueryVariables {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchQueryResult {
  search: {
    items: Array<{
      id: string;
      title: string;
      content: string;
      author: {
        id: string;
        name: string;
      };
    }>;
    total: number;
  };
}

/**
 * 예시: 사용자 쿼리 타입
 */
export interface UserQueryVariables {
  userId: string;
}

export interface UserQueryResult {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    profile: {
      bio?: string;
      website?: string;
      location?: string;
    };
  };
}

/**
 * GraphQL 쿼리 문자열 상수
 */
export const GRAPHQL_QUERIES = {
  SEARCH: `
    query Search($query: String!, $limit: Int, $offset: Int) {
      search(query: $query, limit: $limit, offset: $offset) {
        items {
          id
          title
          content
          author {
            id
            name
          }
        }
        total
      }
    }
  `,

  GET_USER: `
    query GetUser($userId: String!) {
      user(id: $userId) {
        id
        email
        name
        avatar
        profile {
          bio
          website
          location
        }
      }
    }
  `,
} as const;
