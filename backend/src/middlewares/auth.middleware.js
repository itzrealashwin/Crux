import { verifyToken, signAccessToken } from "../utils/jwt.util.js"; // Ensure generateToken is exported
import { sendError } from "../utils/response.util.js";
import User from "../models/users.model.js";
import AuthToken from "../models/authToken.model.js";
import { hashValue } from "../utils/hash.util.js";

export const authenticate = async (req, res, next) => {
  try {
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;

    // --- CASE 1: Valid Access Token ---
    if (accessToken) {
      const decoded = verifyToken(accessToken);

      if (decoded) {
        const tokenUserId = decoded.id || decoded.userId;
        const user = await User.findById(tokenUserId)
          .select("_id role isActive")
          .lean();

        if (!user || user.isActive === false) {
          return sendError(res, "Unauthorized: User not found or inactive", 401);
        }

        req.user = {
          _id: user._id.toString(),
          id: user._id.toString(),
          role: user.role,
        };
        return next();
      }
      // If code reaches here, accessToken exists but is expired/invalid.
      // We intentionally fall through to the refresh logic below.
    }

    // --- CASE 2: Refresh Token Fallback ---
    if (!refreshToken) {
      return sendError(res, "Unauthorized: No valid session", 401);
    }

    // Verify the refresh token
    // Note: If you use a different secret for refresh tokens, use verifyRefreshToken(refreshToken) here
    const decodedRefresh = verifyToken(refreshToken, true);

    if (!decodedRefresh) {
      return sendError(
        res,
        "Unauthorized: Session expired, please login again",
        401
      );
    }

    const refreshUserId = decodedRefresh.id || decodedRefresh.userId;
    const incomingRefreshTokenHash = hashValue(refreshToken);

    const tokenRecord = await AuthToken.findOne({
      userId: refreshUserId,
      refreshTokenHash: incomingRefreshTokenHash,
      isRevoked: false,
      refreshTokenExpiresAt: { $gt: new Date() },
    })
      .select("_id userId")
      .lean();

    if (!tokenRecord) {
      return sendError(
        res,
        "Unauthorized: Session invalid or revoked, please login again",
        401
      );
    }

    const user = await User.findById(refreshUserId)
      .select("_id role isActive")
      .lean();

    if (!user || user.isActive === false) {
      return sendError(res, "Unauthorized: User not found or inactive", 401);
    }

    // --- CASE 3: Issue New Access Token ---
    // Generate a fresh access token (e.g., valid for 15 mins)
    const newAccessToken = signAccessToken({
      id: user._id,
      role: user.role,
    });

    // Set the new token in the cookie (match your original cookie options)
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    // Attach user to request and proceed
    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      role: user.role,
    };

    console.log("🔄 Access Token Refreshed via Middleware");
    next();
  } catch (error) {
    next(error);
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    console.log(req.user);
    
    if (!req.user || !roles.includes(req.user.role)) {
      return sendError(
        res,
        "Forbidden: You do not have permission to perform this action",
        403
      );
    }
    next();
  };
};
