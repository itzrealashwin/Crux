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
