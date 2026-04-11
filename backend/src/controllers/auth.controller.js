import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.util.js';
const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction, // true in prod (HTTPS), false in dev (HTTP)
  sameSite: isProduction ? 'none' : 'lax', // 'none' for cross-domain prod, 'lax' for localhost dev
  path: '/',
};

const USER_ID_COOKIE_OPTIONS = {
  httpOnly: false, // Accessible by frontend JS
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  path: '/',
};

const ACCESS_TOKEN_EXPIRY = 15 * 60 * 1000; // 15 mins
const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.register(email, password);
    sendSuccess(res, user, 'Registration successful', 201);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const ipAddress = req.ip;
    const deviceInfo = req.headers['user-agent'];

    const { accessToken, refreshToken, userId } = await authService.login(email, password, ipAddress, deviceInfo);
  
    // Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    // Frontend-readable user identifier cookie (display/routing use only)
    res.cookie('userId', String(userId), {
      ...USER_ID_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    sendSuccess(res, { user: { email } }, 'Login successful');
  } catch (error) {
    next(error);
  }
};

export const loginAsGuest = async (req, res, next) => {
  try {
    const ipAddress = req.ip;
    const deviceInfo = req.headers['user-agent'];
    const role = req.body.role || 'STUDENT';

    const { accessToken, refreshToken, userId, email } = await authService.guestLogin(ipAddress, deviceInfo, role);
  
    // Set Access Token Cookie
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: ACCESS_TOKEN_EXPIRY,
    });

    // Set Refresh Token Cookie
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    // Set User ID Cookie for frontend
    res.cookie('userId', String(userId), {
      ...USER_ID_COOKIE_OPTIONS,
      maxAge: REFRESH_TOKEN_EXPIRY,
    });

    sendSuccess(res, { user: { email, isGuest: true, role } }, 'Guest login successful');
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req, res, next) => {
  try {
    // Read refreshToken from cookies instead of body
    const incomingRefreshToken = req.cookies.refreshToken;
    
    if (!incomingRefreshToken) {
      throw { statusCode: 401, message: "Refresh token missing" };
    }

    const ipAddress = req.ip;
    const deviceInfo = req.headers['user-agent'];

    const { accessToken, refreshToken, userId } = await authService.refresh(incomingRefreshToken, ipAddress, deviceInfo);

    // Update both cookies with new rotated tokens
    res.cookie('accessToken', accessToken, { ...COOKIE_OPTIONS, maxAge: ACCESS_TOKEN_EXPIRY });
    res.cookie('refreshToken', refreshToken, { ...COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_EXPIRY });
    res.cookie('userId', String(userId), { ...USER_ID_COOKIE_OPTIONS, maxAge: REFRESH_TOKEN_EXPIRY });
    
    sendSuccess(res, null, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    // Clear cookies on client side
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);
    res.clearCookie('userId', USER_ID_COOKIE_OPTIONS);
    
    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};


export const getMe = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const user = await authService.getUserById(userId);
    sendSuccess(res, user, 'User profile fetched successfully');
  } catch (error) {
    next(error);
  }
};