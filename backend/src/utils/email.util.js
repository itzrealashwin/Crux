import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTPEmail = async (toEmail, otp) => {
  const brandColor = "#2563eb"; // A professional blue
  const secondaryColor = "#1e293b"; // Dark slate for text

  transporter.sendMail({
    from: `"Crux" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: ` ${otp} is your Crux verification code`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: ${secondaryColor}; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;">
        
        <div style="background-color: ${brandColor}; padding: 20px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">Crux</h1>
          <p style="color: #e0e7ff; margin: 5px 0 0 0; font-size: 14px;">Placement & Job Management System</p>
        </div>

        <div style="padding: 40px 30px; background-color: #ffffff;">
          <h2 style="margin-top: 0; color: ${secondaryColor}; font-size: 20px;">Verify Your Identity</h2>
          <p>Hello,</p>
          <p>You are receiving this email because a request was made to access your <strong>Crux</strong> account. Use the verification code below to proceed:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; padding: 15px 40px; background-color: #f8fafc; border: 2px dashed ${brandColor}; border-radius: 12px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: ${brandColor};">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 10px;">This code expires in <strong>5 minutes</strong>.</p>
          </div>

          <p style="font-size: 14px; color: #64748b;">If you did not request this code, please ignore this email or contact your placement administrator if you have concerns.</p>
        </div>

        <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Crux | Educational Placement Portal</p>
          <p style="margin: 5px 0 0 0;">This is an automated security notification. Please do not reply to this email.</p>
        </div>

      </div>
    `,
  });
};
