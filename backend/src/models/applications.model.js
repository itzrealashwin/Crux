import mongoose from 'mongoose';
import { assignUniqueCode, generatePrefixedCode } from '../utils/shortId.util.js';

const applicationSchema = new mongoose.Schema({
  appId: {
    type: String,
    unique: true,
    index: true,
    immutable: true,
  },

  // ── Relations ─────────────────────────────────────────────────────────────
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  studentProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'StudentProfile'
  },

  // ── Eligibility Snapshot (Frozen at time of apply) ────────────────────────
  // Vital for audit: even if student's profile changes later,
  // we know what it was when they applied.
  eligibilitySnapshot: {
    cgpa:           { type: Number, required: true },
    backlogs:       { type: Number, required: true },
    department:     { type: String, required: true },
    graduationYear: { type: Number },
    // [NEW] — xthMarks and xIIthMarks were in jobs.model criteria
    // but missing from the snapshot. Now they can be checked in analytics.
    xthMarks:       { type: Number, default: 0 },
    xIIthMarks:     { type: Number, default: 0 },
    resumeUrl:      { type: String },
    isEligible:     { type: Boolean, required: true },
  },

  // ── Auto Screening Tag ────────────────────────────────────────────────────
  // [NEW] Replaces the raw isEligible boolean with a 3-tier tag.
  // Set automatically by applyToJob middleware before saving.
  //
  //   ELIGIBLE    — meets all criteria → shown first in admin review
  //   BORDERLINE  — minor miss (e.g. CGPA 0.1 below cutoff) → admin can override
  //   INELIGIBLE  — clearly doesn't meet criteria → filtered out by default
  //
  // Admin dashboard defaults to showing ELIGIBLE pool, saving hours of manual work.
  autoScreeningTag: {
    type: String,
    enum: ['ELIGIBLE', 'BORDERLINE', 'INELIGIBLE'],
    default: 'ELIGIBLE',
    index: true
  },
  // Breakdown of which criteria passed/failed (shown to admin on hover)
  screeningDetails: {
    cgpaPass:       { type: Boolean },
    backlogPass:    { type: Boolean },
    departmentPass: { type: Boolean },
    batchPass:      { type: Boolean },
    xthPass:        { type: Boolean },
    xIIthPass:      { type: Boolean },
    skillsMatch:    [{ type: String }],  // Skills from job that student has
    skillsMissing:  [{ type: String }],  // Skills from job that student lacks
  },

  // ── Application Status ────────────────────────────────────────────────────
  status: {
    type: String,
    enum: [
      'APPLIED',      // Just submitted
      'SHORTLISTED',  // Passed resume/auto screening
      'INTERVIEW',    // Currently in interview rounds
      'SELECTED',     // Offer rolled out
      'HIRED',        // Offer accepted by student
      'REJECTED',     // Rejected by company/admin
      'WITHDRAWN'     // Withdrawn by student
    ],
    default: 'APPLIED',
    index: true
  },

  // ── Round Tracking ────────────────────────────────────────────────────────
  // Maps to the selectionProcess array in jobs.model
  currentRound: {
    step: { type: Number, default: 1 },
    name: { type: String, default: 'Resume Screening' }
  },
  // [NEW] Track completion of each round individually
  roundResults: [{
    step:      { type: Number },
    name:      { type: String },
    result:    { type: String, enum: ['PASSED', 'FAILED', 'PENDING'] },
    note:      { type: String, trim: true },      // Admin note for this round
    updatedAt: { type: Date, default: Date.now },
  }],

  // ── Admin Feedback ────────────────────────────────────────────────────────
  // Visible only to admins — raw internal notes
  adminComments: {
    type: String,
    trim: true
  },

  // ── Rejection ─────────────────────────────────────────────────────────────
  // [IMPROVED] — was only 4 generic codes before. Richer codes enable better
  // analytics (e.g. "how many students are failing at coding round?") and
  // more useful feedback to students.
  rejectionReason: {
    type: String,
    enum: [
      // Eligibility failures (auto-set by system)
      'CGPA_BELOW_CUTOFF',
      'BACKLOG_LIMIT_EXCEEDED',
      'DEPARTMENT_NOT_ALLOWED',
      'BATCH_NOT_ELIGIBLE',
      'MARKS_BELOW_CUTOFF',
      // Selection process failures
      'FAILED_APTITUDE_TEST',
      'FAILED_CODING_ROUND',
      'FAILED_TECHNICAL_INTERVIEW',
      'FAILED_HR_INTERVIEW',
      'FAILED_GROUP_DISCUSSION',
      // Procedural
      'INCOMPLETE_PROFILE',
      'DID_NOT_ATTEND',
      'OFFER_NOT_ACCEPTED_IN_TIME',
      // Company-side
      'VACANCY_FILLED',
      'COMPANY_CANCELLED_DRIVE',
      // Misc
      'OTHER',
    ],
  },

  // [NEW] Student-visible feedback — separate from admin's internal notes.
  // Admins write this knowing the student will see it.
  // Keeps it professional while giving the student actual closure.
  feedbackForStudent: {
    type: String,
    trim: true,
    maxlength: [600, "Student feedback cannot exceed 600 characters"],
    // Example: "Your aptitude test score was below the cutoff for this role.
    // We recommend practising quantitative reasoning and verbal ability."
  },

  // ── Offer Details (only if SELECTED or HIRED) ────────────────────────────
  offerDetails: {
    packageLPA:    { type: Number },
    offerLetterUrl:{ type: String },
    joiningDate:   { type: Date },
    // [NEW] Track whether the student accepted or declined the offer
    offerStatus: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
      default: 'PENDING',
    },
    responseDeadline: { type: Date },  // Last date to accept the offer
  },

  // ── History / Audit Trail ─────────────────────────────────────────────────
  // Powers the "Recent Activity" feed in the admin dashboard.
  // Also shows students a timeline of their application journey.
  history: [{
    status:    { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    comment:   { type: String },
  }]

}, {
  timestamps: true   // createdAt = applied date, updatedAt = last action
});

applicationSchema.pre('validate', async function (next) {
  try {
    await assignUniqueCode(this, 'appId', () => generatePrefixedCode('APP'));
    next();
  } catch (error) {
    next(error);
  }
});

// ── Indexes ──────────────────────────────────────────────────────────────────

// Prevent duplicate applications
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true });

// "My Applications" page — latest first
applicationSchema.index({ studentId: 1, createdAt: -1 });

// Admin screening queue — eligible candidates first, for a given job
applicationSchema.index({ jobId: 1, autoScreeningTag: 1, status: 1 });

// Analytics: count applications by status across all jobs
applicationSchema.index({ status: 1, createdAt: -1 });

const Application = mongoose.model('Application', applicationSchema);

export default Application;