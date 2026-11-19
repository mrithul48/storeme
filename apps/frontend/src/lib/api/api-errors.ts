// src/lib/api/api-errors.ts
// Standardized API error handling for client and server fetch calls

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details?: unknown;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, details?: unknown, code?: string) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
    this.code = code;
    Object.setPrototypeOf(this, ApiError.prototype);
  }

  static fromResponse(data: any, statusCode: number): ApiError {
    const message =
      typeof data === "string"
        ? data
        : data?.message || data?.error || `Request failed with status ${statusCode}`;
    return new ApiError(message, statusCode, data?.details, data?.code);
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isConflict(): boolean {
    return this.statusCode === 409;
  }

  isRateLimited(): boolean {
    return this.statusCode === 429;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

