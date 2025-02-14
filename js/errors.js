export class APIError extends Error {
  constructor(source, message, originalError) {
    super(`${source} API Error: ${message}`);
    this.source = source;
    this.originalError = originalError;
  }
}
