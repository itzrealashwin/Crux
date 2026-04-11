import User from "../models/users.model.js";
import AuthToken from "../models/authToken.model.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
} from "../utils/jwt.util.js";
import { hashValue } from "../utils/hash.util.js";
import crypto from "crypto";

class AuthService {
  async register(email, password, role = "STUDENT") {
    if (!email.toLowerCase().includes("@mespune.in")) {
      throw { statusCode: 400, message: "Email must be a mespune.in address" };
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw { statusCode: 409, message: "Email already registered" };
    }

    const user = await User.create({
      email,
      passwordHash: password,
      role,
    });

    return {
      _id: user._id,
      email: user.email,
      role: user.role,
    };
  }

  async login(email, password, ipAddress, deviceInfo) {
    if (!email.toLowerCase().includes("@mespune.in")) {
      throw { statusCode: 400, message: "Email must be a mespune.in address" };
    }
    const user = await User.findOne({ email }).select("+passwordHash");
    console.log(user);
    
    if (!user) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw { statusCode: 401, message: "Invalid credentials" };
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({
      id: user._id,
      role : user.role
    });

    const accessTokenHash = hashValue(accessToken);
    const refreshTokenHash = hashValue(refreshToken);

    // Calculate expiry dates
    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15m
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

    await AuthToken.create({
      userId: user._id,
      accessTokenHash,
      refreshTokenHash,
      accessTokenExpiresAt: accessExpiry,
      refreshTokenExpiresAt: refreshExpiry,
      ipAddress,
      deviceInfo,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return { accessToken, refreshToken, userId: user._id.toString() };
  }

  async guestLogin(ipAddress, deviceInfo, role = "STUDENT") {
    const email = role === "STUDENT" ? "guest_student@mespune.in" : "guest_tpo@mespune.in";
    const password = crypto.randomBytes(16).toString("hex"); // Just dummy, won't need it to login

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        email,
        passwordHash: password,
        role,
        isVerified: true,
        isGuest: true,
      });
    }

    // Always ensure the dummy profile exists if role is STUDENT
    if (role === "STUDENT") {
      try {
        const StudentProfile = (await import("../models/studentProfile.model.js")).default;
        const existingProfile = await StudentProfile.findOne({ userId: user._id });
        
        if (!existingProfile) {
          await StudentProfile.create({
            userId: user._id,
            firstName: "Guest",
            lastName: "Student",
            phone: "0000000000",
            department: "COMPUTER",
            graduationYear: 2026,
            xthMarks: 0,
            xIIthMarks: 0,
            cgpa: 0,
            backlogs: 0,
            profileCompleteness: 100
          });
        }
      } catch (err) {
        console.error("Failed to create guest student profile:", err);
      }
    }

    const accessToken = signAccessToken({ id: user._id, role: user.role });
    const refreshToken = signRefreshToken({
      id: user._id,
      role: user.role
    });

    const accessTokenHash = hashValue(accessToken);
    const refreshTokenHash = hashValue(refreshToken);

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000); 
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await AuthToken.create({
      userId: user._id,
      accessTokenHash,
      refreshTokenHash,
      accessTokenExpiresAt: accessExpiry,
      refreshTokenExpiresAt: refreshExpiry,
      ipAddress,
      deviceInfo,
    });

    user.lastLoginAt = new Date();
    await user.save();

    return { accessToken, refreshToken, userId: user._id.toString(), email: user.email };
  }

  async refresh(refreshToken, ipAddress, deviceInfo) {
    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      throw { statusCode: 401, message: "Invalid refresh token" };
    }

    const tokenUserId = decoded.id || decoded.userId;

    const incomingRefreshTokenHash = hashValue(refreshToken);

    const tokenRecord = await AuthToken.findOne({
      userId: tokenUserId,
      refreshTokenHash: incomingRefreshTokenHash,
    });

    if (!tokenRecord) {
      // Potential reuse detection could go here
      throw { statusCode: 401, message: "Invalid refresh token" };
    }

    if (tokenRecord.isRevoked) {
      throw { statusCode: 401, message: "Token revoked" };
    }

    // Rotate tokens
    // Always fetch the user so role and account state come from DB, not stale token payload.
    const user = await User.findById(tokenUserId);
    if (!user) throw { statusCode: 401, message: "User not found" };

    // Re-sign access token with current role
    const rotatedAccessToken = signAccessToken({
      id: user._id,
      role: user.role,
    });
    const newRefreshToken = signRefreshToken({
      id: user._id,
      role: user.role,
    });

    const newAccessTokenHash = hashValue(rotatedAccessToken);
    const newRefreshTokenHash = hashValue(newRefreshToken);

    const accessExpiry = new Date(Date.now() + 15 * 60 * 1000);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Invalidate old token record (or just mark revoked)
    tokenRecord.isRevoked = true;
    await tokenRecord.save();

    // Create new token record
    await AuthToken.create({
      userId: user._id,
      accessTokenHash: newAccessTokenHash,
      refreshTokenHash: newRefreshTokenHash,
      accessTokenExpiresAt: accessExpiry,
      refreshTokenExpiresAt: refreshExpiry,
      ipAddress,
      deviceInfo,
    });

    return {
      accessToken: rotatedAccessToken,
      refreshToken: newRefreshToken,
      userId: user._id.toString(),
    };
  }

  async logout(refreshToken) {
    if (!refreshToken) return;

    const refreshTokenHash = hashValue(refreshToken);

    // We don't verify expiry strictly for logout, we just want to revoke if it exists
    const tokenRecord = await AuthToken.findOne({ refreshTokenHash });

    if (tokenRecord) {
      tokenRecord.isRevoked = true;
      await tokenRecord.save();
    }
  }
  async getUserById(userId) {
    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }
    return user;
  }
}

export default new AuthService();
