import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import dotenv from "dotenv";
import "./cron/cronWorker";

// Routes
import adminRoutes from "./routes/adminRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import customerRoutes from "./routes/customerRoutes";
import discountRoutes from "./routes/discountRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";

// Load environment variables
dotenv.config();

// -------------------------------
// Create Express app
// -------------------------------
const app = express();

// -------------------------------
// Body parser
// -------------------------------
app.use(bodyParser.json());

// -------------------------------
// CORS (production strict)
// -------------------------------

const allowedOrigins = [
  "https://protocol.btmtravel.net",
  "https://btmtravel.net",
  "http://btmtravel.net",
  "http://protocol.btmtravel.net",
  "http://51.75.154.196:8080",
  "http://51.75.154.196",
  "http://localhost:8080"
];


app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // server-to-server / Postman
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  })
);

// -------------------------------
// MongoDB connection
// -------------------------------
const MONGO_URI = process.env.MONGO_URI!;
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(() => {
    process.exit(1);
  });

// -------------------------------
// API routes
// -------------------------------
app.use("/api", adminRoutes);
app.use("/api", bookingRoutes);
app.use("/api", customerRoutes);
app.use("/api", discountRoutes);
app.use("/api", feedbackRoutes);

// -------------------------------
// Start server
// -------------------------------
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
