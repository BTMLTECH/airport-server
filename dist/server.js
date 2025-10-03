"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const emailUtil_1 = require("./utils/emailUtil");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(body_parser_1.default.json());
const allowedOrigins = [
    "http://localhost:8080",
    "http://localhost:8081",
    // process.env.FRONTEND_URL!,
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
}));
app.post("/api/airport", async (req, res) => {
    try {
        const { date, flight, time, protocolOfficer, passengerName, company, meetingLocation, baggageAssistance, handoverToDriver, luggageNo, arrivalComment, arrivalRating, protocolOfficerMeet, meetingPlace, immigrationFormProvided, fastTrackProvided, meetGreetLevel, handoverToAirside, airsideOfficerName, airsideOfficerTel, } = req.body;
        const emailSent = await (0, emailUtil_1.sendEmail)(process.env.ADMIN_EMAIL, "New Protocol Report", "protocol.ejs", {
            date,
            flight,
            time,
            protocolOfficer,
            passengerName,
            company,
            meetingLocation,
            baggageAssistance,
            handoverToDriver,
            luggageNo,
            arrivalComment,
            arrivalRating,
            protocolOfficerMeet,
            meetingPlace,
            immigrationFormProvided,
            fastTrackProvided,
            meetGreetLevel,
            handoverToAirside,
            airsideOfficerName,
            airsideOfficerTel,
            companyName: "Airport Protocol Services",
        });
        if (emailSent) {
            return res
                .status(200)
                .json({ success: true, message: "Protocol report sent successfully" });
        }
        else {
            return res
                .status(500)
                .json({ success: false, message: "Failed to send email" });
        }
    }
    catch (error) {
        console.error("Error sending protocol report:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
app.post("/api/booking", async (req, res) => {
    try {
        const { fullName, email, phone, services, flightDate, flightTime, flightNumber, airportTerminal, passengers, specialRequests, discountCode, referralSource, } = req.body;
        const emailSent = await (0, emailUtil_1.sendEmail)(process.env.ADMIN_EMAIL, "New Booking Request", "booking.ejs", {
            fullName,
            email,
            phone,
            services,
            flightDate,
            flightTime,
            flightNumber,
            airportTerminal,
            passengers,
            specialRequests,
            discountCode,
            referralSource,
            companyName: "BTM logbook",
        });
        if (emailSent) {
            return res
                .status(200)
                .json({ success: true, message: "Email sent successfully" });
        }
        else {
            return res
                .status(500)
                .json({ success: false, message: "Failed to send email" });
        }
    }
    catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
