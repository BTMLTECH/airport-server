import { Request, Response } from "express";
import { FailedEmail } from "../model/FailedEmail";
import { Feedback } from "../model/Feedback";
import { sendEmail } from "../utils/emailUtil";
import ExcelJS from "exceljs";
import path from "path";
import fs from "fs";


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

    console.log("Received feedback:", req.body);

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

    console.log("Prepared email data:", emailData);

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


// export const exportFeedbackByMonth = async (req: Request, res: Response) => {
//   try {
//     const { month, year } = req.query;
//     console.log("Exporting feedback for:", month, year);

//     if (!month || !year) {
//       return res.status(400).json({
//         success: false,
//         message: "month and year are required",
//       });
//     }

//     const startDate = new Date(Number(year), Number(month) - 1, 1);
//     const endDate = new Date(Number(year), Number(month), 1);

//     const feedbacks = await Feedback.find({
//       createdAt: { $gte: startDate, $lt: endDate },
//     }).lean();

//     const workbook = new ExcelJS.Workbook();
//     const sheet = workbook.addWorksheet("Feedback");

//     sheet.columns = [
//       { header: "Full Name", key: "fullName", width: 25 },
//       { header: "Airline", key: "airlineName", width: 20 },
//       { header: "Trip Date", key: "tripDate", width: 15 },
//       { header: "Service Type", key: "serviceType", width: 15 },
//       { header: "Meeting Location", key: "meetingLocation", width: 20 },
//       { header: "Luggage No", key: "luggageNo", width: 15 },
//       { header: "Arrival Comment", key: "arrivalComment", width: 30 },
//       { header: "Arrival Rating", key: "arrivalRating", width: 15 },
//       { header: "Departure Comment", key: "departureComment", width: 30 },
//       { header: "Departure Rating", key: "departureRating", width: 15 },
//       { header: "Protocol Officer Meet", key: "protocolOfficerMeet", width: 20 },
//       { header: "Immigration Assistance", key: "immigrationAssistance", width: 20 },
//       { header: "Meet In/Outside", key: "meetInOrOutside", width: 15 },
//       { header: "Created At", key: "createdAt", width: 20 },
//     ];

//     feedbacks.forEach((fb) => {
//       sheet.addRow({
//         fullName: fb.fullName,
//         airlineName: fb.airlineName,
//         tripDate: fb.tripDate,
//         serviceType: fb.serviceType,
//         meetingLocation: fb.meetingLocation || "",
//         luggageNo: fb.luggageNo || "",
//         arrivalComment: fb.arrivalComment || "",
//         arrivalRating: fb.arrivalRating || "",
//         departureComment: fb.departureComment || "",
//         departureRating: fb.departureRating || "",
//         protocolOfficerMeet: fb.protocolOfficerMeet || "",
//         immigrationAssistance: fb.immigrationAssistance || "",
//         meetInOrOutside: fb.meetInOrOutside || "",
//         createdAt: fb.createdAt
//           ? new Date(fb.createdAt).toISOString().split("T")[0]
//           : "",
//       });
//     });

//     // Generate Excel buffer
//     const buffer = await workbook.xlsx.writeBuffer();

//     // Correct headers for download
//     res.setHeader(
//       "Content-Type",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//     );
//     res.setHeader(
//       "Content-Disposition",
//       `attachment; filename=feedback_${month}_${year}.xlsx`
//     );
//     res.setHeader("Content-Transfer-Encoding", "binary");
//     res.setHeader("Accept-Ranges", "bytes");

//     return res.send(buffer);
//   } catch (error) {
//     console.error("Excel export error:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to export Excel",
//     });
//   }
// };



export const exportFeedbackByMonth = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: "month and year are required",
      });
    }

    const startDate = new Date(Number(year), Number(month) - 1, 1);
    const endDate = new Date(Number(year), Number(month), 1);

    const feedbacks = await Feedback.find({
      createdAt: { $gte: startDate, $lt: endDate },
    }).lean();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Feedback");

    sheet.columns = [
      { header: "Full Name", key: "fullName", width: 25 },
      { header: "Airline", key: "airlineName", width: 20 },
      { header: "Trip Date", key: "tripDate", width: 15 },
      { header: "Service Type", key: "serviceType", width: 15 },
      { header: "Meeting Location", key: "meetingLocation", width: 20 },
      { header: "Luggage No", key: "luggageNo", width: 15 },
      { header: "Arrival Comment", key: "arrivalComment", width: 30 },
      { header: "Arrival Rating", key: "arrivalRating", width: 15 },
      { header: "Departure Comment", key: "departureComment", width: 30 },
      { header: "Departure Rating", key: "departureRating", width: 15 },
      { header: "Protocol Officer Meet", key: "protocolOfficerMeet", width: 20 },
      { header: "Immigration Assistance", key: "immigrationAssistance", width: 20 },
      { header: "Meet In/Outside", key: "meetInOrOutside", width: 15 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    feedbacks.forEach((fb) => {
      sheet.addRow({
        fullName: fb.fullName,
        airlineName: fb.airlineName,
        tripDate: fb.tripDate,
        serviceType: fb.serviceType,
        meetingLocation: fb.meetingLocation || "",
        luggageNo: fb.luggageNo || "",
        arrivalComment: fb.arrivalComment || "",
        arrivalRating: fb.arrivalRating || "",
        departureComment: fb.departureComment || "",
        departureRating: fb.departureRating || "",
        protocolOfficerMeet: fb.protocolOfficerMeet || "",
        immigrationAssistance: fb.immigrationAssistance || "",
        meetInOrOutside: fb.meetInOrOutside || "",
        createdAt: fb.createdAt
          ? new Date(fb.createdAt).toISOString().split("T")[0]
          : "",
      });
    });

    // Ensure exports folder exists
    const exportDir = path.join(__dirname, "..", "..", "exports");
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }

    // File path
    const filePath = path.join(
      exportDir,
      `feedback_${month}_${year}.xlsx`
    );

    // Save file to disk
    await workbook.xlsx.writeFile(filePath);

    return res.status(200).json({
      success: true,
      message: "Excel file generated successfully",
      filePath,
    });

  } catch (error) {
    console.error("Excel export error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export Excel",
    });
  }
};
