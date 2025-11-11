/**
 * API 에러 핸들러
 * Axios 에러와 GraphQL 에러를 통합 처리합니다.
 */

import { AxiosError } from 'axios';
import { toast } from 'sonner';
import {
  ApiError,
  ERROR_CODES,
  ERROR_MESSAGES,
  ErrorHandlerOptions,
  ErrorCode,
} from '../types/error.types';

/**
 * HTTP 상태 코드를 에러 코드로 변환
 */
function statusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ERROR_CODES.BAD_REQUEST;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 408:
      return ERROR_CODES.TIMEOUT;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 500:
      return ERROR_CODES.SERVER_ERROR;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Axios 에러를 ApiError로 정규화
 */
function normalizeAxiosError(error: AxiosError): ApiError {
  // 네트워크 에러
  if (!error.response) {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return new ApiError(
        408,
        ERROR_CODES.TIMEOUT,
        ERROR_MESSAGES.TIMEOUT
      );
    }
    return new ApiError(
      0,
      ERROR_CODES.NETWORK_ERROR,
      ERROR_MESSAGES.NETWORK_ERROR
    );
  }

  // 서버 응답이 있는 경우
  const status = error.response.status;
  const data = error.response.data as any;
  const code = data?.code || statusToErrorCode(status);
  const message = data?.message || ERROR_MESSAGES[code as ErrorCode] || error.message;

  return new ApiError(status, code, message, data);
}

/**
 * GraphQL 에러를 ApiError로 정규화
 */
function normalizeGraphQLError(error: any): ApiError {
  const firstError = error.response?.errors?.[0];
  const code = firstError?.extensions?.code || ERROR_CODES.GRAPHQL_ERROR;
  const message = firstError?.message || ERROR_MESSAGES.GRAPHQL_ERROR;

  return new ApiError(400, code, message, error.response);
}

/**
 * 에러를 ApiError로 정규화
 */
export function normalizeError(error: unknown): ApiError {
  // 이미 ApiError인 경우
  if (error instanceof ApiError) {
    return error;
  }

  // Axios 에러
  if (error instanceof AxiosError) {
    return normalizeAxiosError(error);
  }

  // GraphQL 에러 (graphql-request)
  if (error && typeof error === 'object' && 'response' in error) {
    const gqlError = error as any;
    if (gqlError.response?.errors) {
      return normalizeGraphQLError(gqlError);
    }
  }

  // 일반 Error
  if (error instanceof Error) {
    return new ApiError(
      500,
      ERROR_CODES.UNKNOWN_ERROR,
      error.message || ERROR_MESSAGES.UNKNOWN_ERROR
    );
  }

  // 알 수 없는 에러
  return new ApiError(
    500,
    ERROR_CODES.UNKNOWN_ERROR,
    ERROR_MESSAGES.UNKNOWN_ERROR
  );
}

/**
 * 에러를 처리하고 토스트를 표시
 */
export function handleApiError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): ApiError {
  const {
    showToast = true,
    customMessage,
    logError = true,
  } = options;

  const apiError = normalizeError(error);

  // 토스트 표시
  if (showToast) {
    const message = customMessage || apiError.message;
    toast.error(message);
  }

  // 개발 환경에서 콘솔 로그
  if (logError && process.env.NODE_ENV === 'development') {
    console.error('API Error:', {
      status: apiError.status,
      code: apiError.code,
      message: apiError.message,
      data: apiError.data,
    });
  }

  return apiError;
}

/**
 * 에러가 특정 상태 코드인지 확인
 */
export function isErrorStatus(error: unknown, status: number): boolean {
  if (error instanceof ApiError) {
    return error.status === status;
  }
  if (error instanceof AxiosError) {
    return error.response?.status === status;
  }
  return false;
}

/**
 * 에러가 특정 코드인지 확인
 */
export function isErrorCode(error: unknown, code: ErrorCode): boolean {
  if (error instanceof ApiError) {
    return error.code === code;
  }
  return false;
}

/**
 * 인증 에러인지 확인
 */
export function isAuthError(error: unknown): boolean {
  return (
    isErrorStatus(error, 401) ||
    isErrorCode(error, ERROR_CODES.UNAUTHORIZED) ||
    isErrorCode(error, ERROR_CODES.TOKEN_EXPIRED) ||
    isErrorCode(error, ERROR_CODES.INVALID_TOKEN)
  );
}
