// utils/emailConfig.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

// Create reusable transporter object
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD, // Use App Password, not regular password
  },
});

module.exports = transporter;