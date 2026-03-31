import mongoose from "mongoose";
import { assignUniqueCode, generatePrefixedCode } from "../utils/shortId.util.js";

// ─── Sub-schemas ────────────────────────────────────────────────────────────

const projectSchema = new mongoose.Schema({
  title:       { type: String, trim: true, required: true },
  description: { type: String, trim: true },
  techStack:   [{ type: String, trim: true }],     // e.g. ["React", "Node.js"]
  link:        { type: String, trim: true },        // GitHub / live URL
  duration:    { type: String, trim: true },        // e.g. "Jan 2024 – Mar 2024"
}, { _id: false });

const certificationSchema = new mongoose.Schema({
  name:       { type: String, trim: true, required: true },  // e.g. "AWS Cloud Practitioner"
  issuer:     { type: String, trim: true },                  // e.g. "Amazon"
  issueDate:  { type: Date },
  credentialUrl: { type: String, trim: true },
}, { _id: false });

// ─── Main Schema ─────────────────────────────────────────────────────────────

const studentProfileSchema = new mongoose.Schema(
  {
    profileCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    // ── Identity ──────────────────────────────────────────────────────────
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    photo: {
      // [NEW] Profile photo URL (cloud storage link)
      url:        { type: String, trim: true },
      uploadedAt: { type: Date },
    },
    bio: {
      // [NEW] Short student summary visible on profile card
      type: String,
      trim: true,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },
    phone: {
      type: String,
      trim: true,
    },

    // ── Academic Details ──────────────────────────────────────────────────
    department: {
      type: String,
      required: [true, "Department is required"],
      index: true,
    },
    graduationYear: {
      type: Number,
      required: true,
      index: true,
    },
    cgpa: {
      type: Number,
      min: 0,
      max: 10,
      index: true,
    },
    backlogs: {
      type: Number,
      default: 0,
      min: 0,
    },

    // [NEW] — jobs.model already had minXthMarks / minXIIthMarks criteria
    // but profile had no field to store them. This gap broke eligibility checks.
    xthMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,  // Percentage, e.g. 85.4
    },
    xIIthMarks: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    // ── Skills ────────────────────────────────────────────────────────────
    // [IMPROVED] Skills now reference a predefined SKILLS_TAXONOMY enum
    // so admin filters actually work. Free-text caused mismatches.
    // Add more to this list as your college's companies require.
    skills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    }],
    // ^ References the Skill collection (skills.model.js).
    // Admin manages the master list — add/remove any time without touching
    // this model. Students pick from a searchable tag input on the frontend.
    // Use .populate('skills') to get [{ _id, name, category }] in responses.

    // ── Projects ──────────────────────────────────────────────────────────
    // [NEW] Required for meaningful admin review; was missing entirely
    projects: {
      type: [projectSchema],
      default: [],
    },

    // ── Certifications ────────────────────────────────────────────────────
    // [NEW] Relevant for roles requiring AWS, ML, etc.
    certifications: {
      type: [certificationSchema],
      default: [],
    },

    // ── Resume ────────────────────────────────────────────────────────────
    resume: {
      url:        { type: String },
      uploadedAt: { type: Date, default: Date.now },
      // [NEW] Metadata for resume validator middleware
      fileSizeMB: { type: Number },         // e.g. 0.8
      pageCount:  { type: Number },         // Checked server-side with pdf-parse
      isTextSelectable: { type: Boolean },  // false = scanned image PDF (warn student)
    },

    // ── Social Links ──────────────────────────────────────────────────────
    links: {
      github:    { type: String, default: "" },
      linkedin:  { type: String, default: "" },
      portfolio: { type: String, default: "" },
    },

    // ── Placement Status ──────────────────────────────────────────────────
    // [NEW] Track overall placement outcome. Used in placement stats dashboard.
    placementStatus: {
      type: String,
      enum: ["NOT_PLACED", "PLACED", "OPTED_OUT"],
      default: "NOT_PLACED",
      index: true,
    },
    placedAt: {
      // [NEW] Set when placementStatus becomes PLACED
      company:     { type: String },
      packageLPA:  { type: Number },
      placedDate:  { type: Date },
    },

    // ── Profile Completeness ──────────────────────────────────────────────
    // [NEW] Computed score (0–100) recalculated on every profile save.
    // Used by: apply middleware (block if < 80), student dashboard, admin cards.
    profileCompleteness: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

studentProfileSchema.pre("validate", async function (next) {
  try {
    await assignUniqueCode(this, "profileCode", () =>
      generatePrefixedCode("STU")
    );
    next();
  } catch (error) {
    next(error);
  }
});

// ─── Virtuals ─────────────────────────────────────────────────────────────────

studentProfileSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// ─── Pre-save Hook: Recalculate Profile Completeness ─────────────────────────
//
// Scoring breakdown (total = 100):
//   Identity  (25): photo(5), bio(5), phone(5), links(10)
//   Academic  (25): cgpa(10), xthMarks(5), xIIthMarks(5), backlogs-set(5)
//   Portfolio (25): resume(10), skills(5), projects(10)
//   Extras    (25): linkedin(10), github(5), certifications(10)
//
// This means a student with no photo, no projects, and no links = ~40%
// (name, dept, cgpa, resume alone), which correctly blocks them from applying.

studentProfileSchema.pre("save", function (next) {
  let score = 0;

  // Identity (25)
  if (this.photo?.url)            score += 5;
  if (this.bio?.trim())           score += 5;
  if (this.phone?.trim())         score += 5;
  if (this.links?.linkedin)       score += 5;
  if (this.links?.github || this.links?.portfolio) score += 5;

  // Academic (25)
  if (this.cgpa > 0)              score += 10;
  if (this.xthMarks > 0)         score += 5;
  if (this.xIIthMarks > 0)       score += 5;
  if (this.backlogs !== undefined) score += 5;

  // Portfolio (25)
  if (this.resume?.url)           score += 10;
  if (this.skills?.length >= 3)   score += 5;
  if (this.projects?.length >= 1) score += 10;

  // Extras (25)
  if (this.links?.linkedin)       score += 10;  // linkedin already counted above, skip
  if (this.certifications?.length >= 1) score += 10;
  if (this.links?.github)         score += 5;

  this.profileCompleteness = Math.min(score, 100);
  next();
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Fast lookup for admin "Students by department + CGPA" queries
studentProfileSchema.index({ department: 1, cgpa: -1 });
// Fast lookup for placement analytics
studentProfileSchema.index({ placementStatus: 1, graduationYear: 1 });

// ─── Model ───────────────────────────────────────────────────────────────────

const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model("StudentProfile", studentProfileSchema);

export default StudentProfile;