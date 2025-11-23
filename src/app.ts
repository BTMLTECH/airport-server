import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

const app = express();

// Body parser
app.use(bodyParser.json());

// CORS
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
           const allowedOrigins = [
        // "http://localhost:8080",
        // FRONTEND,
        "https://protocol.btmtravel.net",
      ];
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  })
);

export default app;
