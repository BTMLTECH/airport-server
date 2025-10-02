import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendEmail } from "./utils/emailUtil";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(bodyParser.json());

const allowedOrigins = [
  "http://localhost:8080",
  // process.env.FRONTEND_URL!,
];
app.use(
  cors({
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
  })
);

app.post("/api/booking", async (req: Request, res: Response) => {
  try {
    const {
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
    } = req.body;

    // Example: Pass form data to email template
    const emailSent = await sendEmail(
      process.env.ADMIN_EMAIL!,
      "New Booking Request",
      "booking.ejs",
      {
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
        companyName: "Airport Protocol Services",
      }
    );

    if (emailSent) {
      return res
        .status(200)
        .json({ success: true, message: "Email sent successfully" });
    } else {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send email" });
    }
  } catch (error) {
    console.error("Error sending email:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
