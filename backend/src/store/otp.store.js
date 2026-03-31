/**
 * In-memory OTP store
 * -------------------
 * Structure:
 * email -> {
 *   otp: String,
 *   expiresAt: Number (timestamp in ms)
 * }
 *
 * Example:
 * otpStore.set("user@x`x.com", {
 *   otp: "123456",
 *   expiresAt: 1710000000000
 * });
 */

const otpStore = new Map();

/**
 * Save OTP for an email
 */
export const saveOTP = (email, otp, expiresAt) => {
  otpStore.set(email, { otp, expiresAt });
};

/**
 * Get OTP data for an email
 */
export const getOTP = (email) => {
  return otpStore.get(email);
};

/**
 * Delete OTP after verification or expiry
 */
export const deleteOTP = (email) => {
  otpStore.delete(email);
};

/**
 * Optional: Clear expired OTPs (can be called manually or via cron)
 */
export const clearExpiredOTPs = () => {
  const now = Date.now();

  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiresAt) {
      otpStore.delete(email);
    }
  }
};

export default otpStore;
