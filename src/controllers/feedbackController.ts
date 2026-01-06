import { Request, Response } from "express";
import { FailedEmail } from "../model/FailedEmail";
import { Feedback } from "../model/Feedback";
import { sendEmail } from "../utils/emailUtil";


export const customerFeedback = async (req: Request, res: Response) => {
  try {
    const {
      fullName,
      airlineName,
      tripDate,
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


    const sanitizedFeedback = {
      fullName: fullName || undefined,
      airlineName: airlineName || undefined,
      tripDate: tripDate || undefined,
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

    const feedback = await Feedback.create(sanitizedFeedback);

    const emailData: any = { 
      ...feedback.toObject(),
      companyName: "BTMTravel-Protocol", 
      logo: "https://res.cloudinary.com/dhbmufbz8/image/upload/w_80/v1765442901/mmmowztxjy92h800rbra.png",
      fullName: feedback.fullName || "",
      airlineName: feedback.airlineName || "",
      tripDate: feedback.tripDate || "N/A",
      arrivalComment: feedback.arrivalComment || "",
      departureComment: feedback.departureComment || "",
      arrivalRating: feedback.arrivalRating || "",
      departureRating: feedback.departureRating || "",
      meetingLocation: feedback.meetingLocation || "",
      protocolOfficerMeet: feedback.protocolOfficerMeet || "",
      immigrationAssistance: feedback.immigrationAssistance || "",
      meetInOrOutside: feedback.meetInOrOutside || "",
      createdAt: feedback.createdAt ? feedback.createdAt.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos", 
    }) : "N/A", 
    };


    // List of emails to send
    const recipients = [process.env.HR_EMAIL!, process.env.CUSTOMER_DETAIL_EMAIL!];

    const failedEmails: any[] = [];

    for (const recipient of recipients) {
      try {
        const emailSent = await sendEmail(recipient, "New Feedback", "protocol.ejs", emailData);
        if (!emailSent) {
          throw new Error("Email rejected by server");
        }
      } catch (emailErr: any) {
        // Save failed email for retry
        await FailedEmail.create({
          to: recipient,
          subject: "New Feedback Submission",
          template: "protocol.ejs",
          payload: emailData,
          error: emailErr.message,
          source: "feedback",
        });

        failedEmails.push(recipient);
      }
    }

    if (failedEmails.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Feedback email sent successfully to all recipients",
      });
    } else {
      return res.status(500).json({
        success: false,
        message: `Failed to send feedback email to: ${failedEmails.join(", ")}, retry scheduled`,
      });
    }

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

