

import express, { Request, Response } from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { sendEmail } from "./utils/emailUtil";
import mongoose from "mongoose";
import { Payment } from "./model/Payment";
import axios from "axios";
import cron from "node-cron";
import { FailedEmail } from "./model/FailedEmail";
import { Feedback } from "./model/Feedback";
import { Customer } from "./model/Customer";

dotenv.config();

const PAYSTACK_SECRET_KEY = (process.env.PAYSTACK_SECRET_KEY || "").trim();
const MONGO_URI = process.env.MONGO_URI!;
const FRONTEND = process.env.FRONTEND_PROTOCOL!

const app = express();
const PORT = process.env.PORT || 8080;


mongoose
  .connect(MONGO_URI)
  .then(() => {

  cron.schedule("*/10 * * * *", async () => {

  const failedEmails = await FailedEmail.find({ attempts: { $lt: 5 } });

  for (const email of failedEmails) {
    try {
      await sendEmail(email.to, email.subject, email.template, email.payload);
      await email.deleteOne();
    } catch (err: any) {
      email.attempts += 1;
      email.lastAttempt = new Date();
      email.error = err.message;
      await email.save();
    }
  }
});


    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(() => {
    process.exit(1);
  });


app.use(bodyParser.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        // "http://localhost:8080",
        FRONTEND,
        "https://protocol.btmtravel.net",
      ];
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`), false);
    },
    credentials: true,
  })
);


app.post("/api/feedback", async (req: Request, res: Response) => {
  try {
    const {
      serviceType,
      meetingLocation,
      luggageNo,
      arrivalComment,
      arrivalRating,
      protocolOfficerMeet,
      immigrationAssistance,
      meetInOrOutside,
    } = req.body;

    // -------------------------------
    // Sanitize input: empty strings => undefined
    // -------------------------------
    const sanitizedFeedback = {
      serviceType,
      meetingLocation: meetingLocation || undefined,
      luggageNo: luggageNo || undefined,
      arrivalComment: arrivalComment || undefined,
      arrivalRating: arrivalRating || undefined,
      protocolOfficerMeet: protocolOfficerMeet || undefined,
      immigrationAssistance: immigrationAssistance || undefined,
      meetInOrOutside: meetInOrOutside || undefined,
    };

    // -------------------------------
    // Save feedback
    // -------------------------------
    const feedback = await Feedback.create(sanitizedFeedback);

    // Prepare email payload
    const emailData: any = { ...feedback.toObject() };

    // -------------------------------
    // Send email with retry handling
    // -------------------------------
    try {
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
        throw new Error("Email rejected by server");
      }
    } catch (emailErr: any) {

      // Save failed email for retry
      await FailedEmail.create({
        to: process.env.ADMIN_EMAIL!,
        subject: "New Feedback Submission",
        template: "protocol.ejs",
        payload: emailData,
        error: emailErr.message,
        source: "feedback",
      });

      return res.status(500).json({
        success: false,
        message: "Failed to send feedback email, retry scheduled",
      });
    }
  } catch (error: any) {
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
      btmProtocolOfficerName,
      partnerProtocolOfficerName,
      partnerProtocolOfficerMobile,
      badgeVerification,
      checkInIssues,
      checkInComment,
    } = req.body;

    // -------------------------------
    // Save customer to DB
    // -------------------------------
    const customer = await Customer.create({
      passengerName,
      contact,
      email,
      btmProtocolOfficerName,
      partnerProtocolOfficerName,
      partnerProtocolOfficerMobile,
      badgeVerification,
      checkInIssues,
      checkInComment,
    });

    const emailData = {
      ...customer.toObject(),
      companyName: "BTMTravel-Protocol",
    };

    // -------------------------------
    // Send email to admin
    // -------------------------------
    try {
      await sendEmail(
        process.env.ADMIN_EMAIL!,
        "New Customer - BTMTravel",
        "customer-detail.ejs",
        emailData
      );

      return res.status(200).json({
        success: true,
        message: "Customer saved and check-in report sent successfully",
        customer,
      });
    } catch (emailErr: any) {

      // -------------------------------
      // Save failed email for retry
      // -------------------------------
      await FailedEmail.create({
        to: process.env.ADMIN_EMAIL!,
        subject: "Customer Check-in Report",
        template: "customer-detail.ejs",
        payload: emailData,
        error: emailErr.message,
        source: "customer",
      });

      return res.status(500).json({
        success: true,
        message:
          "Customer saved but failed to send email. Retry scheduled.",
        customer,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
});


app.post("/api/booking", async (req: Request, res: Response) => {
  try {
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
      totalDollarPrice,
      currency,
      type,
      returnService,
      returnDate,
      returnFlight,
      returnNotes,
    } = req.body;


    if (!email || !fullName) {
      return res.status(400).json({ error: "Customer email and name are required" });
    }

    if (!type || !["domestic", "international"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing booking type" });
    }

    // -------------------------------
    // 1️⃣ Map 'tag' to 'serviceType'
    // -------------------------------
    const normalizedServices = (selectedServicesDetails || []).map((svc: any) => ({
      ...svc,
      serviceType: svc.tag || "offline",
      tag: undefined, // optional: remove the 'tag' field
    }));

    // -------------------------------
    // 2️⃣ Initialize Paystack payment
    // -------------------------------
    const amountInSmallestUnit =
      currency === "USD"
        ? Math.round(totalDollarPrice * 100)
        : Math.round(totalPrice * 100);

    const paystackResponse = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email,
        amount: amountInSmallestUnit,
        currency,
        metadata: { fullName, type },
        callback_url: `${process.env.BACKEND_URL}/api/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const { authorization_url, reference } = paystackResponse.data.data;

    // -------------------------------
    // 3️⃣ Save booking to DB
    // -------------------------------
     await Payment.create({
      reference,
      fullName,
      email,
      phone,
      services,
      selectedServicesDetails: normalizedServices,
      flightDate,
      flightTime,
      flightNumber,
      departureCity,
      arrivalCity,
      passengers,
      specialRequests,
      discountCode,
      referralSource,
      totalPrice: currency === "USD" ? totalDollarPrice : totalPrice,
      totalDollarPrice: currency === "USD" ? totalDollarPrice : undefined,
      currency,
      status: "pending",
      type,
      companyName: "BTMTravel-Protocol",
      returnService,
      returnDate,
      returnFlight,
      returnNotes,
    });

    // -------------------------------
    // 4️⃣ Return Paystack URL
    // -------------------------------
    res.json({ url: authorization_url, reference });

  } catch (error: any) {
    res.status(500).json({ error: "Payment initialization failed" });
  }
});

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

    // ✅ Only verify if still pending
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

      // ✅ If payment succeeded, send notifications
      if (payment.status === "success") {

        // Common payload for templates
        const emailPayload = {
          ...payment.toObject(),
          companyName: "BTMTravel",
        };

        // 🟢 1. Admin Notification
        try {
          await sendEmail(
            process.env.ADMIN_EMAIL!,
            "New Booking - BTMTravel",
            "booking.ejs",
            emailPayload
          );
        } catch (err: any) {
          await FailedEmail.create({
            to: process.env.ADMIN_EMAIL!,
            subject: "New Booking - BTMTravel",
            template: "booking.ejs",
            payload: emailPayload,
            error: err.message,
            source: "payment-verification-admin",
          });
        }

        // 🟢 2. Customer Confirmation
        try {
          await sendEmail(
            payment.email,
            "Your Booking Confirmation - BTMTravel",
            "confirmation.ejs",
            emailPayload
          );
        } catch (err: any) {
          await FailedEmail.create({
            to: payment.email,
            subject: "Your Booking Confirmation - BTMTravel",
            template: "confirmation.ejs",
            payload: emailPayload,
            error: err.message,
            source: "payment-verification-customer",
          });
        }
      }
    }

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ error: "Payment verification failed" });
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
