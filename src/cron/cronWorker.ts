


import mongoose from "mongoose";
import cron from "node-cron";
import { sendEmail } from "../utils/emailUtil";
import { sendSMS, sendWhatsApp } from "../utils/twilio";
import { FailedEmail } from "../model/FailedEmail";
import { Payment } from "../model/Payment";
import { convertTo12HourFormat } from "../utils/generateDiscount";
import moment from 'moment-timezone';

// =======================================================
// CONNECT MONGO
// =======================================================
mongoose
  .connect(process.env.MONGO_URI!)
  .then(() => console.log("✅ Cronjob Connected to MongoDB"))
  .catch(() => process.exit(1));

// =======================================================
// RETRY FAILED EMAILS
// =======================================================
cron.schedule("*/5 * * * *", async () => {  // Every minute for testing

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

// =======================================================
// 1️⃣ SEND REMINDERS 1 HOUR BEFORE FLIGHT
// Applies to: Paid + Free Requests
// =======================================================
cron.schedule("*/1 * * * *", async () => {

  const now = moment.utc();

  const payments = await Payment.find({
    $or: [{ status: "success" }, { isFreeRequest: true }],
    feedbackSent: { $ne: true },
  });

  for (const booking of payments) {
    if (!booking.flightDate || !booking.flightTime) continue;

    const flightDT = moment.utc(
      `${booking.flightDate} ${booking.flightTime}`,
      "YYYY-MM-DD HH:mm"
    );

    const sixHoursAfter = flightDT.clone().add(6, "hours");

  

    if (now.isSameOrAfter(sixHoursAfter)) {

      const message = `Hello, thank you for using BTMTravel. Please share your feedback here: ${process.env.FEEDBACK_URL}`;

      let smsSid: string | null = null;

      // 🟢 TRY SMS FIRST
      try {
        const smsResult = await sendSMS(booking.phone, message);
        smsSid = smsResult?.sid || null;

      } catch (err) {
      }

      // 🔁 FALLBACK TO WHATSAPP IF SMS FAILED
      if (!smsSid) {

        try {
        await sendWhatsApp(booking.phone, message);
        } catch (err) {
        }
      }

      // Mark feedback as sent regardless of channel
      booking.feedbackSent = true;
      booking.feedbackSentAt = now.toISOString();
      await booking.save();

    }
  }
});

cron.schedule("*/1 * * * *", async () => {

  const now = moment.utc();

  const payments = await Payment.find({
    $or: [{ status: "success" }, { isFreeRequest: true }],
    reminderSent: { $ne: true },
  });

  for (const booking of payments) {
    if (!booking.flightDate || !booking.flightTime) continue;

    const flightDT = moment.utc(
      `${booking.flightDate} ${booking.flightTime}`,
      "YYYY-MM-DD HH:mm"
    );

    const sixHoursBefore = flightDT.clone().subtract(6, "hours");

   
    if (now.isSameOrAfter(sixHoursBefore)) {

      const formattedFlightTime = convertTo12HourFormat(booking.flightTime);

      const emailPayload = {
        ...booking.toObject(),
        flightTime: formattedFlightTime,
        companyName: "BTMTravel",
      };

      try {
        await sendEmail(
          emailPayload.email,
          "Upcoming Flight - Reminder",
          "reminder.ejs",
          emailPayload
        );

        booking.reminderSent = true;
        booking.reminderSentAt = now.toISOString();
        await booking.save();

      } catch (err) {
      }
    }
  }
});


