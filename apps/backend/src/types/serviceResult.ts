/** Kết quả chuẩn cho tất cả service/router */
export interface ServiceResult<T = void> {
  isSuccess: boolean;
  message: string;
  errorCode?: string;
  data?: T;
}

/** Builder giữ tương thích với code cũ */
export class ServiceResultBuilder {
  static success<T>(message: string, data?: T): ServiceResult<T> {
    return { isSuccess: true, message, data } as any;
  }

  static failure<T = void>(
    message: string,
    errorCode?: string
  ): ServiceResult<T> {
    return { isSuccess: false, message, errorCode };
  }
}

/** Helpers gọn dùng trong router/services */
export function ok<T>(data?: T, message = "OK"): ServiceResult<T> {
  return { isSuccess: true, message, data };
}

export function fail(
  message = "FAILED",
  errorCode?: string
): ServiceResult<void> {
  return { isSuccess: false, message, errorCode };
}

/** Unwrap tiện dụng (ném lỗi nếu fail) */
export function unwrap<T>(res: ServiceResult<T>): T {
  if (!res.isSuccess) {
    throw new Error(res.message || "ServiceResult failed");
  }
  return res.data as T;
}

/** Một số error code gợi ý (tuỳ chọn) */
export const E = {
  BAD_REQUEST: "BAD_REQUEST",
  NOT_FOUND: "NOT_FOUND",
  FORBIDDEN: "FORBIDDEN",
  CONFLICT: "CONFLICT",
  INTERNAL: "INTERNAL",
} as const;
