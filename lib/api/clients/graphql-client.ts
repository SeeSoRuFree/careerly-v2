/**
 * GraphQL API 클라이언트
 * graphql-request 기반으로 React Query와 함께 사용합니다.
 */

import { GraphQLClient } from 'graphql-request';
import { API_CONFIG } from '../config';
import { getMemoryToken } from '../auth/token.client';

/**
 * GraphQL 클라이언트 인스턴스
 */
export const graphqlClient = new GraphQLClient(API_CONFIG.GRAPHQL_URL, {
  credentials: 'include', // httpOnly 쿠키 전송

  // 요청 미들웨어: 토큰 추가
  requestMiddleware: (request) => {
    const token = getMemoryToken();

    return {
      ...request,
      headers: {
        ...request.headers,
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  },

  // 응답 미들웨어: 에러 로깅
  responseMiddleware: (response) => {
    if (response instanceof Error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('GraphQL Error:', response);
      }
    }
  },
});

/**
 * GraphQL 요청 래퍼 함수
 * 에러 처리와 타입 안정성을 제공합니다.
 */
export async function graphqlRequest<TData, TVariables = Record<string, unknown>>(
  query: string,
  variables?: TVariables
): Promise<TData> {
  try {
    return await graphqlClient.request<TData>(query, variables as any);
  } catch (error) {
    // GraphQL 에러는 interceptor/error-handler에서 처리
    throw error;
  }
}

/**
 * GraphQL Mutation 래퍼 함수
 */
export async function graphqlMutation<TData, TVariables = Record<string, unknown>>(
  mutation: string,
  variables?: TVariables
): Promise<TData> {
  return graphqlRequest<TData, TVariables>(mutation, variables);
}

/**
 * 공통 에러 핸들러
 */
export { handleApiError } from '../interceptors/error-handler';
