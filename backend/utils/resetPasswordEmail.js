const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

async function sendResetPasswordEmail(to, token) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const verificationLink = process.env.CLIENT_URL + `/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: "Reset Password",
    html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2>Reset Password</h2>
        <p>Silakan klik tombol di bawah ini untuk mereset password Anda:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verificationLink}" 
             style="background-color: #4CAF50; color: white; padding: 15px 25px; text-decoration: none; border-radius: 5px;">
             Reset Password
          </a>
        </div>
        <p>Atau copy dan paste link berikut ke browser Anda:</p>
        <p>${verificationLink}</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    // console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

module.exports = sendResetPasswordEmail;
