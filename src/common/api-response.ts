export enum ErrorCode {
  NONE = '',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DECRYPT_FAILED = 'DECRYPT_FAILED',
  ENCRYPT_FAILED = 'ENCRYPT_FAILED',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppException extends Error {
  constructor(public readonly errorCode: ErrorCode, public readonly status = 400, message?: string) {
    super(message ?? errorCode);
  }
}

export interface ApiResponse<T> {
  successful: boolean;
  error_code: string;
  data: T | null;
}

export const ok = <T>(data: T): ApiResponse<T> => ({ successful: true, error_code: ErrorCode.NONE, data });
export const fail = (code: ErrorCode): ApiResponse<null> => ({ successful: false, error_code: code, data: null });
