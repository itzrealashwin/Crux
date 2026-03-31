import mongoose from 'mongoose';
import { assignUniqueCode, generatePrefixedCode } from '../utils/shortId.util.js';

// ─── Notification Model ───────────────────────────────────────────────────────
//
// Powers the in-app notification bell (separate from email).
// Your existing email.util.js handles emails — this handles the in-app feed.
//
// How it works:
//   1. A service (notificationService.js) creates a Notification document
//      whenever a significant event happens (status change, new job, slot booked).
//   2. The frontend polls GET /notifications or subscribes via Socket.io.
//   3. Student sees a bell icon with unread count on their dashboard.
//
// This model intentionally keeps it simple — no push notification tokens,
// no email preferences here. Those go in a separate UserPreferences model
// when you're ready to scale.

const notificationSchema = new mongoose.Schema({
  notificationCode: {
    type: String,
    unique: true,
    index: true,
    immutable: true,
  },

  // ── Recipient ──────────────────────────────────────────────────────────────
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // ── Content ────────────────────────────────────────────────────────────────
  type: {
    type: String,
    required: true,
    enum: [
      // Application events
      'APPLICATION_SHORTLISTED',     // Student's app moved to shortlisted
      'APPLICATION_REJECTED',        // Student's app rejected (with feedback)
      'APPLICATION_STATUS_CHANGED',  // Generic status change
      'OFFER_RECEIVED',              // Offer rolled out
      'OFFER_DEADLINE_REMINDER',     // 24h before offer acceptance deadline

      // Drive events
      'NEW_JOB_POSTED',              // New job relevant to student's profile
      'JOB_DEADLINE_REMINDER',       // 24h before application closes
      'DRIVE_TIMELINE_UPDATED',      // Admin updated a stage in the drive timeline
      'SHORTLIST_RELEASED',          // Shortlist for a drive is out
      'RESULTS_RELEASED',            // Final result released

      // Interview events
      'INTERVIEW_REMINDER',          // 1 day before interview (sent manually by admin)

      // Profile events
      'PROFILE_INCOMPLETE_REMINDER', // Nudge student to complete profile
      'RESUME_UPLOAD_REMINDER',
    ],
    index: true
  },

  title:   { type: String, required: true, trim: true },  // Short heading
  message: { type: String, required: true, trim: true },  // One-line description

  // ── Context (for deep-linking) ────────────────────────────────────────────
  // Frontend uses this to route the user on click:
  //   { entityType: 'JOB', entityId: '...' } → /jobs/:id
  //   { entityType: 'APPLICATION', entityId: '...' } → /applications/:id
  link: {
    entityType: {
      type: String,
      enum: ['JOB', 'APPLICATION', 'PROFILE', 'DRIVE_TIMELINE', 'INTERVIEW_SLOT'],
    },
    entityId: { type: mongoose.Schema.Types.ObjectId },
    url:       { type: String },   // Optional absolute path override
  },

  // ── Read State ────────────────────────────────────────────────────────────
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: { type: Date },

  // ── Priority ──────────────────────────────────────────────────────────────
  // HIGH = show as banner/toast; NORMAL = bell count only
  priority: {
    type: String,
    enum: ['HIGH', 'NORMAL', 'LOW'],
    default: 'NORMAL'
  },

  // ── Auto-expire ───────────────────────────────────────────────────────────
  // Notifications older than 60 days auto-delete (TTL index below).
  // Keeps the collection lean.
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),  // 60 days
  },

}, {
  timestamps: true
});

notificationSchema.pre('validate', async function (next) {
  try {
    await assignUniqueCode(this, 'notificationCode', () =>
      generatePrefixedCode('NOTI')
    );
    next();
  } catch (error) {
    next(error);
  }
});

// ── Indexes ───────────────────────────────────────────────────────────────────

// Unread count query (used in nav bell icon)
notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

// TTL index — MongoDB auto-deletes docs after expiresAt
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;


// ─── Usage Example (in your controller/service) ───────────────────────────────
//
// import Notification from './notification.model.js';
//
// // When admin changes application status to SHORTLISTED:
// await Notification.create({
//   userId:  application.studentId,
//   type:    'APPLICATION_SHORTLISTED',
//   title:   'You've been shortlisted!',
//   message: `Your application for ${jobTitle} at ${companyName} has moved forward.`,
//   priority: 'HIGH',
//   link: { entityType: 'APPLICATION', entityId: application._id }
// });
//
// // When admin sends an interview reminder manually:
// await Notification.create({
//   userId:   application.studentId,
//   type:     'INTERVIEW_REMINDER',
//   title:    'Interview tomorrow',
//   message:  `Your interview for ${companyName} is scheduled for tomorrow. Check with your placement officer for details.`,
//   priority: 'HIGH',
//   link: { entityType: 'APPLICATION', entityId: application._id }
// });