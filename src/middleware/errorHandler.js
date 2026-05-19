import multer from "multer";

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  if (err.stack) console.error(err.stack);

  // Multer errors
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message:
        err.code === "LIMIT_FILE_SIZE"
          ? "File too large. Maximum size is 5MB."
          : err.message,
    });
  }

  // File validation errors
  if (
    err.message?.includes("Only JPEG") ||
    err.message?.includes("PNG") ||
    err.message?.includes("WEBP") ||
    err.message?.includes("image")
  ) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Default error response
  const status = err.status || err.statusCode || 500;

  return res.status(status).json({
    success: false,
    message: err.message || "Something went wrong on the server.",
  });
};
