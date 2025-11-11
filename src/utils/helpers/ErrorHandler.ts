
// Custom Error Handler
// This class extends the built-in Error class to create a custom error handler
class CustomErrorHandler extends Error {

  public statusCode?: number;

  /**
   * CustomErrorHandler constructor
   * @param {string} message - The error message
   * @param {number} [statusCode=400] - The HTTP status code (default is 400)
   */
  constructor(message: string, statusCode?: number) {
    super(message);

    // Set the prototype explicitly.
    Object.setPrototypeOf(this, CustomErrorHandler.prototype);

    // Set the error status
    this.statusCode = statusCode || 400;
  }

  sayHello() {
    return "hello " + this.message;
  }
}

// Export the CustomErrorHandler class
export default CustomErrorHandler;