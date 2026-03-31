import jwt from 'jsonwebtoken';
import { config } from '../config/env.config.js';

export const signAccessToken = (payload) => {
  console.log("Signing Payload:", payload);
  return jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpiry });
};

export const signRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiry });
};

export const verifyToken = (token, isRefreshToken = false) => {
  const secret = isRefreshToken ? config.jwt.refreshSecret : config.jwt.accessSecret;
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    return null;
  }
};
