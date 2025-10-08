"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMailToUser = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sendMailToUser = async (options) => {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.SMPT_HOST,
        port: parseInt(process.env.SMPT_PORT || "587"),
        secure: false,
        auth: {
            user: process.env.SMPT_MAIL,
            pass: process.env.SMPT_PASSWORD,
        },
        tls: {
            rejectUnauthorized: false,
        },
        logger: process.env.NODE_ENV !== "production",
        debug: process.env.NODE_ENV !== "production",
    });
    const { email, subject, template, data } = options;
    try {
        const templatePath = path_1.default.join(__dirname, "../mail", template);
        const html = await ejs_1.default.renderFile(templatePath, data);
        const fromEmail = process.env.SMPT_MAIL;
        const displayName = data?.companyName || "Your Company";
        const mailOptions = {
            from: `"${displayName}" <${fromEmail}>`,
            to: email,
            subject,
            html,
        };
        const info = await transporter.sendMail(mailOptions);
        return {
            accepted: info.accepted || [],
            rejected: info.rejected || [],
        };
    }
    catch (error) {
        return {
            accepted: [],
            rejected: [email],
        };
    }
};
exports.sendMailToUser = sendMailToUser;
