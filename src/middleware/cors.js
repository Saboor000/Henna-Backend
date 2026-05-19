import cors from "cors";

const allowedOrigins = [
  process.env.CLIENT_URL, // e.g. http://localhost:3000
  process.env.CLIENT_URL_PROD, // e.g. https://your-domain.com
].filter(Boolean); // removes undefined if env var is missing

const corsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: origin ${origin} not allowed`));
    }
  },
  credentials: true, // allow cookies / Authorization headers
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

export const corsMiddleware = cors(corsOptions);
