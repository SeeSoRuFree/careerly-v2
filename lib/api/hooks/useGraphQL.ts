/**
 * GraphQL 공통 훅
 * graphql-request와 React Query를 결합합니다.
 */

'use client';

import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { graphqlRequest, graphqlMutation } from '../clients/graphql-client';

/**
 * GraphQL Query 훅
 */
export function useGraphQL<TData, TVariables = Record<string, unknown>>(
  queryKey: unknown[],
  query: string,
  variables?: TVariables,
  options?: Omit<UseQueryOptions<TData, Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<TData, Error>({
    queryKey: ['graphql', ...queryKey],
    queryFn: () => graphqlRequest<TData, TVariables>(query, variables),
    ...options,
  });
}

/**
 * GraphQL Mutation 훅
 */
export function useGraphQLMutation<TData, TVariables = Record<string, unknown>>(
  mutation: string,
  options?: Omit<UseMutationOptions<TData, Error, TVariables>, 'mutationFn'>
) {
  return useMutation<TData, Error, TVariables>({
    mutationFn: (variables) => graphqlMutation<TData, TVariables>(mutation, variables),
    ...options,
  });
}
