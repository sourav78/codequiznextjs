import CustomErrorHandler from "./ErrorHandler";

export const asyncHandler = (fn: Function) => {
  return async (req: Request) => {
    try {
      return await fn(req);
    } catch (error: any) {
      // Handle custom error
      if (error instanceof CustomErrorHandler) {
        return Response.json({
          success: false,
          message: error.message || "Something went wrong. Please try again",
        },
          { status: error.statusCode || 500 }
        )
      }

      // Handle other errors
      return Response.json({
        success: false,
        message: "Something went wrong. Please try again",
      },
        { status: 500 }
      )
    }
  };
};