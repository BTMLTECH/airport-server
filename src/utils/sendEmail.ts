
import nodemailer, { Transporter } from 'nodemailer';
import ejs from 'ejs';
import path from 'path';
require('dotenv').config();
import dotenv from "dotenv";

dotenv.config();

interface EmailOptions {
  email: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

// export const sendMailToUser = async (
//   options: EmailOptions
// ): Promise<{ accepted: string[]; rejected: string[] }> => {
//   const transporter: Transporter = nodemailer.createTransport({
//     host: process.env.SMPT_HOST,
//     port: parseInt(process.env.SMPT_PORT || "587"),
//     secure: false,
//     auth: {
//       user: process.env.SMPT_MAIL,
//       pass: process.env.SMPT_PASSWORD,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//     logger: process.env.NODE_ENV !== "production",
//     debug: process.env.NODE_ENV !== "production",
//   });

//   const { email, subject, template, data } = options;

//   try {
//     const templatePath = path.join(__dirname, "../mail", template);
//     const html = await ejs.renderFile(templatePath, data);

//     const fromEmail = process.env.SMPT_MAIL;
//     const displayName = data?.companyName || "Your Company";

//     const mailOptions = {
//       from: `"${displayName}" <${fromEmail}>`,
//       to: email,
//       subject,
//       html,
//     };

//     const info = await transporter.sendMail(mailOptions);

//     return {
//       accepted: info.accepted || [],
//       rejected: info.rejected || [],
//     };
//   } catch (error) {
//     return {
//       accepted: [],
//       rejected: [email],
//     };
//   }
// };


// interface EmailOptions {
//   email: string;
//   subject: string;
//   template: string;
//   data: { [key: string]: any };
// }

export const sendMailToUser = async (
  options: EmailOptions,
): Promise<{ accepted: string[]; rejected: string[] }> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMPT_HOST,
    port: parseInt(process.env.SMPT_PORT || '587'),
    secure: false,
    // service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.SMPT_MAIL,
      pass: process.env.SMPT_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
    logger: true,
    debug: true,
  });

  const { data, email, subject, template } = options;

  const templatePath = path.join(__dirname, '../mail', template);
  const html = await ejs.renderFile(templatePath, data);

  const fromEmail = process.env.SMPT_MAIL;
  const displayName = data?.companyName;

  const mailOptions = {
    from: `"${displayName}" <${fromEmail}>`,
    to: email,
    subject,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return {
      accepted: info.accepted || [],
      rejected: info.rejected || [],
    };
  } catch (error) {
    return {
      accepted: [],
      rejected: [email],
    };
  }
};

export default sendMailToUser;
