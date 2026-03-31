import mongoose from "mongoose";
import {
  assignUniqueCode,
  generatePrefixedCode,
} from "../utils/shortId.util.js";

// ─── Skill Model ──────────────────────────────────────────────────────────────
//
// Admin-managed master list of skills. Students pick from this collection
// via a searchable tag input (like LinkedIn's skill picker).
//
// Why a separate collection instead of an enum on StudentProfile:
//   - Admin can add/remove skills at any time without touching model code
//   - Skills can be categorised (Languages, Frameworks, Tools, Soft Skills)
//   - Consistent naming across all students → admin filters actually work
//   - jobs.skillsRequired can reference the same names for match scoring
//   - You can add metadata later (icon, aliases, popularity count) without migration

const skillSchema = new mongoose.Schema(
  {
    skillCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },

    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      // Store in canonical form: "Node.js" not "nodejs" or "NodeJS"
      // Enforce this in the admin controller before saving.
    },

    category: {
      type: String,
      required: true,
      enum: [
        "Language", // Java, Python, C++
        "Frontend", // React, Vue, HTML, CSS
        "Backend", // Node.js, Spring Boot, Django
        "Database", // PostgreSQL, MongoDB, Redis
        "Cloud & DevOps", // AWS, Docker, Kubernetes
        "Data & AI", // TensorFlow, Pandas, Power BI
        "Mobile", // Android, Flutter, React Native
        "Tools", // Git, Figma, Postman
        "Testing & QA", // Jest, Selenium, Cypress
        "Cybersecurity", // Ethical Hacking, Network Security
        "Design", // Figma, UI/UX Design
        "Soft Skill", // Communication, Leadership
        "Other",
      ],
      index: true,
    },

    // Aliases help search: student types "js" and finds "JavaScript"
    aliases: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
      index: true,
      // Set to false to retire a skill without deleting it.
      // Inactive skills are hidden from the student picker but
      // preserved on existing profiles that already have them.
    },

    // Denormalized — incremented when a student adds this skill.
    // Useful for showing "trending skills" on the student dashboard.
    usageCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

skillSchema.pre("validate", async function (next) {
  try {
    await assignUniqueCode(this, "skillCode", () =>
      generatePrefixedCode("SKL"),
    );
    next();
  } catch (error) {
    next(error);
  }
});

// Case-insensitive text search (used by the skill picker autocomplete endpoint)
skillSchema.index({ name: "text", aliases: "text" });

const Skill = mongoose.model("Skill", skillSchema);

export default Skill;
