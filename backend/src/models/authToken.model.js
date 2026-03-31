import mongoose from 'mongoose';
import { assignUniqueCode, generatePrefixedCode } from '../utils/shortId.util.js';

const authTokenSchema = new mongoose.Schema({
  tokenCode: {
    type: String,
    unique: true,
    index: true,
    immutable: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  accessTokenHash: {
    type: String,
    required: true
  },
  refreshTokenHash: {
    type: String,
    required: true
  },
  accessTokenExpiresAt: {
    type: Date,
    required: true
  },
  refreshTokenExpiresAt: {
    type: Date,
    required: true
  },
  ipAddress: {
    type: String
  },
  deviceInfo: {
    type: String
  },
  isRevoked: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

authTokenSchema.pre('validate', async function (next) {
  try {
    await assignUniqueCode(this, 'tokenCode', () => generatePrefixedCode('TOK'));
    next();
  } catch (error) {
    next(error);
  }
});

const AuthToken = mongoose.model('AuthToken', authTokenSchema);

export default AuthToken;
