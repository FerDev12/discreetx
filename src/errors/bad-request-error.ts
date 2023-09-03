import { BaseError, SerializedError } from './base-error';

export class BadRequestError extends BaseError {
  status = 400;
  name = 'Bad Reqeust Error';
  message = 'Something went wrong';

  constructor(message?: string, name?: string) {
    super(message);

    if (name) {
      this.name = name;
    }

    Object.setPrototypeOf(this, BadRequestError.prototype);
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
