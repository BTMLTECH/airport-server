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
      if (!origin) return callback(null, true); // allow Postman or server requests
      const allowedOrigins = [
        "https://protocol.btmtravel.net",
        "http://protocol.btmtravel.net",
        "http://51.75.154.196",
        "http://51.75.154.196:8080",
        // "http://localhost:5173",
        // "http://localhost:8080",
      ];
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  })
);


export default app;
