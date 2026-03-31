import mongoose from 'mongoose';
import { assignUniqueCode, generatePrefixedCode } from '../utils/shortId.util.js';

// ─── Drive Timeline Sub-schema ────────────────────────────────────────────────
//
// [NEW] This is the biggest transparency feature for students.
// Each job/drive publishes a visible timeline so students know
// exactly what's coming and when — no more "when will we hear back?" messages.
//
// Admin marks stages complete via a PATCH /jobs/:id/timeline/:stageKey endpoint.

const driveStageSchema = new mongoose.Schema({
  key: {
    type: String,
    enum: [
      'APPLICATION_OPEN',
      'APPLICATION_CLOSE',
      'SHORTLIST_RELEASED',
      'APTITUDE_TEST',
      'CODING_ROUND',
      'GROUP_DISCUSSION',
      'TECHNICAL_INTERVIEW',
      'HR_INTERVIEW',
      'OFFER_ROLLOUT',
      'DRIVE_CLOSED',
    ],
    required: true
  },
  label:  { type: String, trim: true },         // Human readable, e.g. "Aptitude Test"
  date:   { type: Date },                        // Scheduled date (set by admin upfront)
  isDone: { type: Boolean, default: false },     // Admin marks as done when stage passes
  note:   { type: String, trim: true },          // Optional: "Results on portal by 5pm"
}, { _id: false });


// ─── Main Schema ─────────────────────────────────────────────────────────────

const jobSchema = new mongoose.Schema({
  jobCode: {
    type: String,
    unique: true,
    index: true,
    immutable: true,
  },

  // ── Company ───────────────────────────────────────────────────────────────
  company: {
    name:    { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    logoUrl: { type: String, trim: true },
    about:   { type: String, trim: true }
  },

  // ── Job Basics ────────────────────────────────────────────────────────────
  title:       { type: String, required: true, trim: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['Full Time', 'Internship', 'Intern + PPO'],
    required: true
  },
  workMode: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  location: { type: String, trim: true },

  // ── Financials ────────────────────────────────────────────────────────────
  packageLPA: { type: Number, required: true },
  salaryBreakup: {
    fixed:    { type: Number },
    variable: { type: Number }
  },
  stipend: {
    amount:    { type: Number, default: 0 },
    frequency: { type: String, enum: ['Monthly', 'Lumpsum'], default: 'Monthly' }
  },
  bond: {
    hasBond:        { type: Boolean, default: false },
    durationYears:  { type: Number },
    penaltyAmount:  { type: Number }
  },

  // ── Eligibility ───────────────────────────────────────────────────────────
  eligibility: {
    minCgpa:            { type: Number, default: 0 },
    maxBacklogs:        { type: Number, default: 0 },
    targetBatch:        [{ type: Number, required: true }],
    allowedDepartments: [{ type: String, enum: ["MCA", "MBA", "B.Tech", "M.Tech", "BCA", "BBA"] }],
    genderAllowed:      { type: String, enum: ['Any', 'Male', 'Female', 'Other'], default: 'Any' },
    minXthMarks:        { type: Number, default: 0 },
    minXIIthMarks:      { type: Number, default: 0 },
    // [NEW] Minimum profile completeness required to apply.
    // Ensures students don't apply with skeleton profiles.
    minProfileCompleteness: { type: Number, default: 60 },
  },

  // ── Selection Process ─────────────────────────────────────────────────────
  selectionProcess: [{
    step: { type: Number },
    name: { type: String }   // e.g. "Aptitude Test", "Coding Round", "HR Interview"
  }],

  skillsRequired: [{ type: String, trim: true }],

  // ── Drive Timeline ────────────────────────────────────────────────────────
  // [NEW] Visible to all eligible students. Admin updates this as the drive progresses.
  // Frontend renders this as a progress stepper on the job detail page.
  driveTimeline: {
    type: [driveStageSchema],
    default: []
  },

  // ── Meta ──────────────────────────────────────────────────────────────────
  vacancies:     { type: Number, default: 1 },
  deadline:      { type: Date, required: true },
  attachmentUrl: { type: String },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  status: {
    type: String,
    enum: ['DRAFT', 'OPEN', 'CLOSED', 'HOLD'],  // [NEW] DRAFT — admin saves but not published yet
    default: 'OPEN',
    index: true
  },

  // [NEW] Denormalized counts — updated via post-save hook on Application model.
  // Avoids an expensive COUNT query every time the admin dashboard loads.
  stats: {
    totalApplications: { type: Number, default: 0 },
    eligible:          { type: Number, default: 0 },
    borderline:        { type: Number, default: 0 },
    ineligible:        { type: Number, default: 0 },
    shortlisted:       { type: Number, default: 0 },
    selected:          { type: Number, default: 0 },
    hired:             { type: Number, default: 0 },
  },

}, {
  timestamps: true
});

jobSchema.pre('validate', async function (next) {
  try {
    await assignUniqueCode(this, 'jobCode', () => generatePrefixedCode('JOB'));
    next();
  } catch (error) {
    next(error);
  }
});

// ── Indexes ───────────────────────────────────────────────────────────────────
// ── Indexes ─────────────────────────────────────────────────

jobSchema.index({ status: 1, deadline: 1 });
jobSchema.index({ "company.name": 1 });

// Fast filter: jobs open to a specific department + batch
jobSchema.index({ "eligibility.targetBatch": 1 });
jobSchema.index({ "eligibility.allowedDepartments": 1 });
const Job = mongoose.model('Job', jobSchema);

export default Job;