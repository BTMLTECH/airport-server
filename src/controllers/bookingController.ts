import { Request, Response } from "express";

import { Payment } from "../model/Payment";
import axios from "axios";
import { Discount } from "../model/Discount";
import { sendEmail } from "../utils/emailUtil";
import { FailedEmail } from "../model/FailedEmail";
import dotenv from "dotenv";
import { convertTo12HourFormat } from "../utils/generateDiscount";

dotenv.config();




export const bookingController = async (req: Request, res: Response) => {
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




  
    const formattedFlightTime = convertTo12HourFormat(flightTime);
    if (!email || !fullName) {
      return res.status(400).json({ error: "Customer email and name are required" });
    }

    if (!type || !["domestic", "international"].includes(type)) {
      return res.status(400).json({ error: "Invalid or missing booking type" });
    }

    // Normalize selected services
    // const normalizedServices = (selectedServicesDetails || []).map((svc: any) => ({
    //   ...svc,
    //   serviceType: svc.tag || "offline",
    //   tag: undefined,
    // }));

    const normalizedServices = (selectedServicesDetails || []).map((svc: any) => {
      const normalizedOptions = svc.options?.map((opt: any) => ({
        type: opt.type,
        priceRange: opt.priceRange,
        priceRangeUSD: opt.priceRangeUSD, 
      }));

      return {
        ...svc,
        serviceType: svc.tag || "offline",
        tag: undefined,
        options: normalizedOptions,
      };
    });

    let storedTotalPrice = 0;
    let storedTotalDollarPrice = 0;

    if (currency === "USD") {
      storedTotalDollarPrice = totalDollarPrice;
    } else {
      storedTotalPrice = totalPrice;
    }

    const isFreeBooking =
      (type === "international") ||
      (type === "domestic" && (storedTotalPrice === 0 || storedTotalDollarPrice === 0));

    if (isFreeBooking) {
        const payment = await Payment.create({
            reference: `FREE-${Date.now()}`,
            isFreeRequest: true,
            fullName,
            email,
            phone,
            services,
            selectedServicesDetails: normalizedServices,
            flightDate,
            flightTime,
            flightNumber,
            arrivalCity,
            passengers,
            specialRequests,
            discountCode,
            referralSource,
            totalPrice: storedTotalPrice, 
            totalDollarPrice: storedTotalDollarPrice,  
            currency,
            status: "pending", 
            type,
            companyName: "BTMTravel-Protocol",
            returnService,
            returnDate,
            returnFlight,
            returnNotes,
          });

              
            const emailPayload = {
              ...payment.toObject(),
              flightTime:formattedFlightTime,
              companyName: "BTMTravel",
            };

            // Prepare promises for both emails
            const emailPromises = [
              // 🟢 1. Admin Notification
              sendEmail(process.env.SOURCING_EMAIL!, "New Booking - BTMTravel", "booking.ejs", emailPayload)
                .then(async() => {
                  if (process.env.AIRPORT_EMAIL!) {
                    await sendEmail(process.env.AIRPORT_EMAIL, "New Booking - BTMTravel", "booking.ejs", emailPayload);
                  }
                })
                .catch((err: any) => {
                  return FailedEmail.create({
                    to: process.env.SOURCING_EMAIL!,
                    subject: "New Booking - BTMTravel",
                    template: "booking.ejs",
                    payload: emailPayload,
                    error: err.message,
                    source: "payment-verification-admin",
                  });
                }),

              // 🟢 2. Customer Confirmation
              sendEmail(payment.email, "Your Booking Confirmation - BTMTravel", "confirmation.ejs", emailPayload)
                .then(() => {
                })
                .catch((err: any) => {
                  return FailedEmail.create({
                    to: payment.email,
                    subject: "Your Booking Confirmation - BTMTravel",
                    template: "confirmation.ejs",
                    payload: emailPayload,
                    error: err.message,
                    source: "payment-verification-customer",
                  });
                }),
            ];

          await Promise.all(emailPromises);
        
          return res.json({
            totalPrice: 0, 
            totalDollarPrice: 0,  
          });
        }

    // ===========================================================
    // PAID BOOKING FLOW (Paystack)
    // ===========================================================
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

    await Payment.create({
      reference,
      isFreeRequest: false,
      fullName,
      email,
      phone,
      services,
      selectedServicesDetails: normalizedServices,
      flightDate,
      flightTime,
      flightNumber,
      arrivalCity,
      passengers,
      specialRequests,
      discountCode,
      referralSource,
      totalPrice,
      totalDollarPrice,
      currency,
      status: "pending",
      type,
      companyName: "BTMTravel-Protocol",
      returnService,
      returnDate,
      returnFlight,
      returnNotes,
    });

    
    res.json({
      url: authorization_url,
      reference,
      totalPrice,
      totalDollarPrice,
      email
    });

  } catch (error) {
    return res.status(500).json({ error: "Booking initialization failed" });
  }
};



export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { reference } = req.query;

    if (!reference || typeof reference !== "string") {
      return res.status(400).json({ error: "Reference is required" });
    }

    // Fetch payment using reference
    const payment = await Payment.findOne({ reference });
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    const formattedFlightTime = convertTo12HourFormat(payment.flightTime);


    // ✅ Only verify if payment is still pending
    if (payment.status === "pending") {

      const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
        }
      );

      const data = response.data.data;

      // Update payment status
      payment.status = data.status === "success" ? "success" : "failed";
      await payment.save();


      // ✅ If payment succeeded, send notifications
      if (payment.status === "success") {

        // 1️⃣ Deactivate discount code if applied
        if (payment.discountCode) {
          await Discount.findOneAndUpdate(
            { code: payment.discountCode },
            { isActive: false }
          );
        }



        // Common payload for templates
        const emailPayload = {
          ...payment.toObject(),
          flightTime: formattedFlightTime,
          companyName: "BTMTravel",
        };

        // Prepare promises for both emails
        const emailPromises = [
          // 🟢 1. Admin Notification
          sendEmail(process.env.SOURCING_EMAIL!, "New Booking - BTMTravel", "booking.ejs", emailPayload)
          .then(async() => {
                      if (process.env.AIRPORT_EMAIL!) {
                        await sendEmail(process.env.AIRPORT_EMAIL, "New Booking - BTMTravel", "booking.ejs", emailPayload);
                      }
                    })
            .catch((err: any) => {
              return FailedEmail.create({
                to: process.env.SOURCING_EMAIL!,
                subject: "New Booking - BTMTravel",
                template: "booking.ejs",
                payload: emailPayload,
                error: err.message,
                source: "payment-verification-admin",
              });
            }),

          // 🟢 2. Customer Confirmation
          sendEmail(payment.email, "Your Booking Confirmation - BTMTravel", "confirmation.ejs", emailPayload)
            .then(() => {
            })
            .catch((err: any) => {
              return FailedEmail.create({
                to: payment.email,
                subject: "Your Booking Confirmation - BTMTravel",
                template: "confirmation.ejs",
                payload: emailPayload,
                error: err.message,
                source: "payment-verification-customer",
              });
            }),
        ];

        // Wait for both emails to complete (either success or failure)
        await Promise.all(emailPromises);
      } else {
      }
    }

    res.json({ success: true, payment });
  } catch (error: any) {
    res.status(500).json({ error: "Payment verification failed" });
  }
};

