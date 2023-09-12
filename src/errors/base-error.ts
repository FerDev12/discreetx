export interface SerializedError {
  name: string;
  message: string;
  validationErrors?: { path: (string | number)[]; message: string }[];
}

export abstract class BaseError extends Error {
  abstract name: string;
  abstract status: number;

  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, BaseError.prototype);
  }

  abstract serializedErrors(): { errors: SerializedError[] };
}
