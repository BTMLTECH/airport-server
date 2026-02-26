// import { Request, Response } from "express";
// import { Booking } from "../model/TraacBooking";
// import { sendEmail } from "../utils/emailUtil";
// import { uploadToCloudinary } from "../utils/cloudinary";



// export const traacBooking = async (req: Request, res: Response) => {
//   try {
//     const { type } = req.body;

//     if (!type) {
//       return res.status(400).json({
//         success: false,
//         message: "Booking type is required",
//       });
//     }

//     // Build base booking data
//     const bookingData: any = {
//       type,
//       clientName: req.body.clientName,
//       traacsCode: req.body.traacsCode,
//       companyEmail: req.body.companyEmail,
//       bookerName: req.body.bookerName,
//       bookerEmail: req.body.bookerEmail,


//     };

  

//     // Retail / Channel fields
//     if (type === "retail" || type === "channel") {
//       // bookingData.bookerName = req.body.bookerName;
//       bookingData.paymentDetail = req.body.paymentDetail;

//       // Upload receipt file to Cloudinary
//       if (req.file) {
//         const uploadResult = await uploadToCloudinary(
//           req.file.buffer,
//           "btm/documents",
//           "auto",
//           "btmlimited"
//         );

//         if (!uploadResult) {
//           return res.status(500).json({
//             success: false,
//             message: "Failed to upload receipt file",
//           });
//         }

//         bookingData.receiptFile = uploadResult.secure_url;
//       }
//     }

//     // Save booking
//     const booking = await Booking.create(bookingData);

//     // ============================
//     // 📧 EMAIL NOTIFICATION
//     // ============================

//     const templateName = "bookingtraac.ejs"; 

//     const emailData = {
//       booking,
//       // logo: logoDataUrl,
//       logo: "https://res.cloudinary.com/dhbmufbz8/image/upload/w_80/v1765442901/mmmowztxjy92h800rbra.png",

//       companyName: "TBS",
//     };

//     // Send to company email
//     await sendEmail(
//       booking.companyEmail,
//       `${type.toUpperCase()} Booking Confirmation`,
//       templateName,
//       emailData
//     );

//     // Send to booker email (corporate only)
//     if (booking.bookerEmail) {
//       await sendEmail(
//         booking.bookerEmail,
//         `${type.toUpperCase()} Booking Confirmation`,
//         templateName,
//         emailData
//       );
//     }

//     return res.json({
//       success: true,
//       message: `${type} booking created successfully`,
//       data: booking,
//     });

//   } catch (error: any) {
//     console.error("Booking Error:", error);
//     return res.status(500).json({
//       success: false,
//       message: error.message || "Server error",
//     });
//   }
// };


// backend/controller/traacBooking.ts
import { Request, Response } from "express";
import { Booking } from "../model/TraacBooking";
import { sendEmail } from "../utils/emailUtil";
import { uploadToCloudinary } from "../utils/cloudinary";

export const traacBooking = async (req: Request, res: Response) => {
  try {
    const { type } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Booking type is required",
      });
    }

    // Build complete booking data from both steps
    const bookingData: any = {
      type,
      
      // Step 1: Personal & Flight Info
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      flightDate: req.body.flightDate,
      flightTime: req.body.flightTime,
      airlineFlightNumber: req.body.airlineFlightNumber,
      arrivalCity: req.body.arrivalCity,
      numberOfPassengers: parseInt(req.body.numberOfPassengers) || 1,
      specialRequests: req.body.specialRequests,
      
      // Step 2: Booking Details
      clientName: req.body.clientName,
      traacsCode: req.body.traacsCode,
      companyEmail: req.body.companyEmail,
      bookerName: req.body.bookerName,
      bookerEmail: req.body.bookerEmail,
    };

    // Retail / Channel fields
    if (type === "retail" || type === "channel") {
      bookingData.paymentDetail = req.body.paymentDetail;

      // Upload receipt file to Cloudinary
      if (req.file) {
        const uploadResult = await uploadToCloudinary(
          req.file.buffer,
          "btm/documents",
          "auto",
          "btmlimited"
        );

        if (!uploadResult) {
          return res.status(500).json({
            success: false,
            message: "Failed to upload receipt file",
          });
        }

        bookingData.receiptFile = uploadResult.secure_url;
      }
    }

    // Save booking
    const booking = await Booking.create(bookingData);

    // ============================
    // 📧 EMAIL NOTIFICATION
    // ============================

    const templateName = "bookingtraac.ejs"; 

    const emailData = {
      booking,
      logo: "https://res.cloudinary.com/dhbmufbz8/image/upload/w_80/v1765442901/mmmowztxjy92h800rbra.png",
      companyName: "TBS",
    };

    // Send to company email
    await sendEmail(
      booking.companyEmail,
      `${type.toUpperCase()} Booking Confirmation`,
      templateName,
      emailData
    );

    // Send to booker email if provided
    if (booking.bookerEmail) {
      await sendEmail(
        booking.bookerEmail,
        `${type.toUpperCase()} Booking Confirmation`,
        templateName,
        emailData
      );
    }

    // Send to passenger email (personal email from Step 1)
    if (booking.email && booking.email !== booking.companyEmail) {
      await sendEmail(
        booking.email,
        `${type.toUpperCase()} Booking Confirmation`,
        templateName,
        emailData
      );
    }

    return res.json({
      success: true,
      message: `${type} booking created successfully`,
      data: booking,
    });

  } catch (error: any) {
    console.error("Booking Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};