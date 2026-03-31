import mongoose from 'mongoose';
import { assignUniqueCode, generatePrefixedCode } from '../utils/shortId.util.js';

const auditLogSchema = new mongoose.Schema({
  auditCode: {
    type: String,
    unique: true,
    index: true,
    immutable: true,
  },
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  action: {
    type: String,
    required: true,
    index: true
  },
  targetType: {
    type: String,
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

auditLogSchema.pre('validate', async function (next) {
  try {
    await assignUniqueCode(this, 'auditCode', () => generatePrefixedCode('AUD'));
    next();
  } catch (error) {
    next(error);
  }
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
