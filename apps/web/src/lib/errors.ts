export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, opts: { code: string; status: number; details?: unknown }) {
    super(message);
    this.name = "AppError";
    this.code = opts.code;
    this.status = opts.status;
    this.details = opts.details;
  }
}

export function toErrorResponse(err: unknown) {
  if (err instanceof AppError) {
    return {
      status: err.status,
      body: { error: err.code, message: err.message, details: err.details },
    };
  }
  return {
    status: 500,
    body: { error: "INTERNAL_SERVER_ERROR", message: "Unexpected error." },
  };
}

