import otpStore from "../store/otp.store.js";
import { generateOTP } from "../utils/otp.util.js";
import { sendOTPEmail } from "../utils/email.util.js";
import { sendSuccess } from "../utils/response.util.js";
import User from "../models/users.model.js";

export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return next({ statusCode: 400, message: "Email is required" });
    }
    if (!email.toLowerCase().includes("mespune.in")) {
      return next({
        statusCode: 400,
        message: "Email must be a mespune.in address",
      });
    }

    const otp = generateOTP();
    const expiresAt = Date.now() + 5 * 60 * 1000;

    otpStore.set(email, { otp, expiresAt });

    // ✅ Real email sending
    await sendOTPEmail(email, otp);

    sendSuccess(res, null, "OTP sent to email successfully");
  } catch (error) {
    next(error);
  }
};
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return next({ statusCode: 400, message: "Email and OTP are required" });
    }

    const storedData = otpStore.get(email);

    if (!storedData) {
      return next({ statusCode: 400, message: "OTP not found or expired" });
    }

    if (Date.now() > storedData.expiresAt) {
      otpStore.delete(email);
      return next({ statusCode: 400, message: "OTP expired" });
    }

    if (storedData.otp !== otp) {
      return next({ statusCode: 400, message: "Invalid OTP" });
    }

    // OTP is valid, remove it from store to prevent reuse
    const user = await User.findOneAndUpdate(
      { email: email.toLowerCase() },
      { isVerified: true },
      { new: true }
    );
    otpStore.delete(email);

    sendSuccess(res, null, "OTP verified successfully");
  } catch (error) {
    next(error);
  }
};
