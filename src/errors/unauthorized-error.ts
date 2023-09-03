import { BaseError, SerializedError } from './base-error';

export class UnauthorizedError extends BaseError {
  status = 401;
  name = 'Unauthorized Error';

  constructor(message?: string) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }

  serializedErrors(): { errors: SerializedError[] } {
    return {
      errors: [
        {
          name: this.name,
          message: this.message,
        },
      ],
    };
  }
}
