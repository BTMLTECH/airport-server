import { Request, Response } from "express";
import { FailedEmail } from "../model/FailedEmail";
import { Feedback } from "../model/Feedback";
import { sendEmail } from "../utils/emailUtil";

export const customerFeedback = async (req: Request, res: Response) => {
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
      departureComment,
      departureRating,
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
      departureComment: departureComment || undefined,
      departureRating: departureRating || undefined,
      immigrationAssistance: immigrationAssistance || undefined,
      meetInOrOutside: meetInOrOutside || undefined,
    };
   

    
    // -------------------------------
    // Save feedback
    // -------------------------------
    const feedback = await Feedback.create(sanitizedFeedback);

    // Prepare email payload
    const emailData: any = { ...feedback.toObject(),
     companyName: "BTMTravel-Protocol", 
     logo: "https://res.cloudinary.com/dhbmufbz8/image/upload/w_80/v1765442901/mmmowztxjy92h800rbra.png"

    };

    // -------------------------------
    // Send email with retry handling
    // -------------------------------
    try {
      const emailSent = await sendEmail(
        process.env.HR_EMAIL!,
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
        to: process.env.HR_EMAIL!,
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
};


