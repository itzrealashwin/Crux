import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { assignUniqueCode, buildUserCode } from "../utils/shortId.util.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    userCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ["STUDENT", "ADMIN", "SUPER_ADMIN"],
      required: true,
      default: "STUDENT",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("validate", async function (next) {
  try {
    await assignUniqueCode(this, "userCode", () => buildUserCode(this.email));
    next();
  } catch (error) {
    next(error);
  }
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model("User", userSchema);

export default User;
