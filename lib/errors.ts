export class AppError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "APP_ERROR", status = 400) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}

export class ValidationError extends AppError {
  constructor(message = "Los datos enviados no son válidos.") {
    super(message, "VALIDATION_ERROR", 400);
    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Tenés que iniciar sesión para continuar.") {
    super(message, "UNAUTHORIZED", 401);
    this.name = "UnauthorizedError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "El horario ya no está disponible.") {
    super(message, "CONFLICT", 409);
    this.name = "ConflictError";
  }
}

export function toPublicErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  return "Ocurrió un error. Intentá de nuevo en unos minutos.";
}
