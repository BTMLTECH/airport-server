"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// import "./cron/cronWorker";
// Routes
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const bookingRoutes_1 = __importDefault(require("./routes/bookingRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const discountRoutes_1 = __importDefault(require("./routes/discountRoutes"));
const feedbackRoutes_1 = __importDefault(require("./routes/feedbackRoutes"));
// Load environment variables
dotenv_1.default.config();
// -------------------------------
// Create Express app
// -------------------------------
const app = (0, express_1.default)();
// -------------------------------
// Body parser
// -------------------------------
app.use(body_parser_1.default.json());
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
    "https://protocol2.btmtravel.net",
    // "http://localhost:8080"
];
// app.use(
//   cors({
//     origin: (origin, callback) => {
//       if (!origin) return callback(null, true); // server-to-server / Postman
//       if (allowedOrigins.includes(origin)) return callback(null, true);
//       callback(new Error(`Origin ${origin} not allowed by CORS`), false);
//     },
//     credentials: true,
//   })
// );
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        // Trim both sides for comparison
        const cleanOrigin = origin.trim();
        const cleanAllowed = allowedOrigins.map(o => o.trim());
        if (cleanAllowed.includes(cleanOrigin))
            return callback(null, true);
        callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
}));
// -------------------------------
// MongoDB connection
// -------------------------------
const MONGO_URI = process.env.MONGO_URI;
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch(() => {
    process.exit(1);
});
// -------------------------------
// API routes
// -------------------------------
app.use("/api", adminRoutes_1.default);
app.use("/api", bookingRoutes_1.default);
app.use("/api", customerRoutes_1.default);
app.use("/api", discountRoutes_1.default);
app.use("/api", feedbackRoutes_1.default);
// -------------------------------
// Start server
// -------------------------------
const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
