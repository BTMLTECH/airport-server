import mongoose from "mongoose";
import app from "./app";
import adminRoutes from "./routes/adminRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import customerRoutes from "./routes/customerRoutes";
import discountRoutes from "./routes/discountRoutes";
import feedbackRoutes from "./routes/feedbackRoutes";
// import "./cron/cronWorker"
import dotenv from "dotenv";
dotenv.config();
const MONGO_URI = process.env.MONGO_URI!;


const PORT = process.env.PORT || 8081;
+

// MongoDB connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.log("err", err)
    process.exit(1);
  });

// Routes
app.use("/api", adminRoutes);
app.use("/api", bookingRoutes);
app.use("/api", customerRoutes);
app.use("/api", discountRoutes);
app.use("/api", feedbackRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});


