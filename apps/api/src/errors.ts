export class ApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Trial request not found") {
    super(message, 404, "not_found");
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, code = "bad_request") {
    super(message, 400, code);
    this.name = "ValidationError";
  }
}

export class RuntimeDataError extends ApiError {
  constructor(message = "Runtime data not initialized. Run npm run reset first.") {
    super(message, 503, "runtime_not_initialized");
    this.name = "RuntimeDataError";
  }
}
