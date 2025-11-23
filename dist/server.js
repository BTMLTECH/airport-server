"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("./app"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const discountRoutes_1 = __importDefault(require("./routes/discountRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
// import "./cron/cronWorker"
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 8081;
+
// MongoDB connection
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => {
    console.log("err", err);
    process.exit(1);
});
// Routes
app_1.default.use("/api", adminRoutes_1.default);
app_1.default.use("/api", bookingRoutes_1.default);
app_1.default.use("/api", customerRoutes_1.default);
app_1.default.use("/api", discountRoutes_1.default);
app_1.default.use("/api", feedbackRoutes_1.default);
// Start server
app_1.default.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
