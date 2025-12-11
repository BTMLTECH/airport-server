import { Request, Response } from "express";

import { Customer } from "../model/Customer";
import { sendEmail } from "../utils/emailUtil";
import { FailedEmail } from "../model/FailedEmail";

// Login
export const createDetail = async (req: Request, res: Response) => {
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

    // Prepare email payload
    const emailData: any = { ...customer.toObject(),
       companyName: "BTMTravel-Protocol", 
       logo: "https://res.cloudinary.com/dhbmufbz8/image/upload/w_80/v1765442901/mmmowztxjy92h800rbra.png"

     };

    // -------------------------------
    // Send email with retry handling
    // -------------------------------
    try {
      const emailSent = await sendEmail(
        process.env.CUSTOMER_DETAIL_EMAIL!,
        "New Customer - BTMTravel",
        "customer-detail.ejs",
        emailData,
        
      );

      if (emailSent) {
        return res.status(200).json({
          success: true,
          message: "Customer saved and check-in report sent successfully",
          customer,
        });
      } else {
        throw new Error("Email rejected by server");
      }
    } catch (emailErr: any) {

      // Save failed email for retry
      await FailedEmail.create({
        to: process.env.CUSTOMER_DETAIL_EMAIL!,
        subject: "Customer Check-in Report",
        template: "customer-detail.ejs",
        payload: emailData,
        error: emailErr.message,
        source: "customer",
      });

      return res.status(500).json({
        success: false,
        message: "Customer saved but failed to send email. Retry scheduled.",
        customer,
      });
    }
  } catch (error: any) {

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
