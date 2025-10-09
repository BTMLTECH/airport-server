import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendEmail } from "./utils/emailUtil";
import mongoose from "mongoose";
import { Payment } from "./model/Payment";
import axios from "axios";

const FRONTEND_URL = process.env.FRONTEND_URL;
const PAYSTACK_SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || "").trim();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// =============================
// 🧩 MongoDB Connection
// =============================
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/btm_payjeje";

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Middleware
app.use(bodyParser.json());

const allowedOrigins = [
  // "http://localhost:8080",
  // "http://localhost:8082",
  process.env.FRONTEND_LOGBOOK!,
  process.env.FRONTEND_PROTOCOL!,
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

app.post("/api/feedback", async (req: Request, res: Response) => {
  try {
    const {
      serviceType,

      // Arrival
      meetingLocation,
      luggageNo,
      arrivalComment,
      arrivalRating,

      // Departure
      protocolOfficerMeet,
      immigrationAssistance,
      meetInOrOutside,
    } = req.body;

    const emailData: any = {
      serviceType,
      companyName: "BTM Airport Services Feedback",
    };

    if (serviceType === "arrival") {
      emailData.meetingLocation = meetingLocation;
      emailData.luggageNo = luggageNo;
      emailData.arrivalComment = arrivalComment;
      emailData.arrivalRating = arrivalRating;
    } else if (serviceType === "departure") {
      emailData.protocolOfficerMeet = protocolOfficerMeet;
      emailData.immigrationAssistance = immigrationAssistance;
      emailData.meetInOrOutside = meetInOrOutside;
    }
    const emailSent = await sendEmail(
      process.env.ADMIN_EMAIL!,
      "New Feedback",
      "protocol.ejs",
      emailData
    );

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Protocol report sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send email",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});
app.post("/api/customer", async (req: Request, res: Response) => {
  try {
    const {
      passengerName,
      contact,
      email,
      protocolOfficer,
      badgeVerification,
      checkInIssues,
      checkInComment,
    } = req.body;

    const emailData: any = {
      passengerName,
      contact,
      email,
      protocolOfficer,
      badgeVerification,
      checkInIssues,
      checkInComment,
      companyName: "Passenger Details",
    };

    const emailSent = await sendEmail(
      process.env.ADMIN_EMAIL!,
      process.env.ADMIN_EMAIL!,
      "customer.ejs",
      emailData
    );

    if (emailSent) {
      return res.status(200).json({
        success: true,
        message: "Check-in report sent successfully",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send customer details",
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});

// app.post("/api/booking", async (req: Request, res: Response) => {
//   try {
//     const {
//       fullName,
//       email,
//       phone,
//       services,
//       flightDate,
//       flightTime,
//       flightNumber,
//       airportTerminal,
//       passengers,
//       specialRequests,
//       discountCode,
//       referralSource,
//     } = req.body;

//     console.log("req.body", req.body);
//     return;

//     const emailSent = await sendEmail(
//       process.env.ADMIN_EMAIL!,
//       "New Booking Request",
//       "booking.ejs",
//       {
//         fullName,
//         email,
//         phone,
//         services,
//         flightDate,
//         flightTime,
//         flightNumber,
//         airportTerminal,
//         passengers,
//         specialRequests,
//         discountCode,
//         referralSource,
//         companyName: "BTM logbook",
//       }
//     );

//     if (emailSent) {
//       return res
//         .status(200)
//         .json({ success: true, message: "Email sent successfully" });
//     } else {
//       return res
//         .status(500)
//         .json({ success: false, message: "Failed to send email" });
//     }
//   } catch (error) {
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// });
app.post("/api/booking", async (req: Request, res: Response) => {
  try {
    const parsedData = JSON.parse(req.body.data);
    const {
      fullName,
      email,
      phone,
      services,
      selectedServicesDetails,
      flightDate,
      flightTime,
      flightNumber,
      departureCity,
      arrivalCity,
      passengers,
      specialRequests,
      discountCode,
      referralSource,
      totalPrice,
      currency,
      type,
    } = parsedData;

    if (!email || !fullName) {
      return res
        .status(400)
        .json({ error: "Customer email and name are required" });
    }

    if (!type || !["domestic", "international"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing booking type" });
    }

    // 1️⃣ Initialize Paystack
    const paystackAmount = Math.round(totalPrice * 100); // convert to kobo
    const response = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: paystackAmount,
        currency: currency || "NGN",
        metadata: { fullName, type }, // ✅ include type in metadata too
        callback_url: `${process.env.BACKEND_URL}/api/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, reference } = response.data.data;

    // 2️⃣ Save payment to DB
    await Payment.create({
      reference,
      fullName,
      email,
      phone,
      services,
      selectedServicesDetails,
      flightDate,
      flightTime,
      flightNumber,
      departureCity,
      arrivalCity,
      passengers,
      specialRequests,
      discountCode,
      referralSource,
      totalPrice,
      currency: currency || "NGN",
      status: "pending",
      type, // ✅ save type
    });

    res.json({ url: authorization_url, reference });
  } catch (error: any) {
    console.error("❌ Booking / Payment initiation error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

// -----------------------------
// Payment Callback
// -----------------------------
app.get("/api/payment/callback", async (req: Request, res: Response) => {
  try {
    let reference = req.query.reference || req.query.trxref;
    if (Array.isArray(reference)) reference = reference[0];
    if (!reference || typeof reference !== "string") {
      return res.redirect(`${FRONTEND_URL}/payment/failed`);
    }

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
      }
    );

    const data = response.data.data;
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.redirect(`${FRONTEND_URL}/payment/failed`);
    }

    if (data.status === "success") {
      payment.status = "success";
      await payment.save();

      // Send admin email
      await sendEmail(
        process.env.ADMIN_EMAIL!,
        "New Booking - BTM",
        "formSubmission.ejs",
        { payment } // now passing the Payment document directly
      );

      // Send user confirmation email
      await sendEmail(
        payment.email,
        "Your Booking Confirmation - BTM",
        "userConfirmation.ejs",
        { payment }
      );

      return res.redirect(
        `${FRONTEND_URL}/payment/success?reference=${reference}`
      );
    }

    payment.status = "failed";
    await payment.save();

    return res.redirect(
      `${FRONTEND_URL}/payment/failed?reference=${reference}`
    );
  } catch (error: any) {
    console.error("❌ Payment callback error:", error);
    return res.redirect(`${FRONTEND_URL}/payment/failed`);
  }
});

// -----------------------------
// Verify Payment Endpoint
// -----------------------------
app.get("/api/verify-payment", async (req: Request, res: Response) => {
  try {
    const { reference } = req.query;
    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ error: "Reference is required" });
    }

    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (payment.status === "pending") {
      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        }
      );

      const data = response.data.data;
      payment.status = data.status === "success" ? "success" : "failed";
      await payment.save();
    }

    res.json({ success: true, payment });
  } catch (error: any) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({ error: "Payment verification failed" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
