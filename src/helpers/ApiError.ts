
export class ApiError extends Error {

  constructor(message: string, public statusCode: number) {
    super(message);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }

    this.name = 'ApiError';
    
    // this.code = response.code;
  }
}