export class ErrorWithStatusCode extends Error {
  constructor(statusCode, message, options = {}) {
    super(message, options);
    this.statusCode = statusCode;
  }
}