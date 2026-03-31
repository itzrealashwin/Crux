import mongoose from "mongoose";
import { assignUniqueCode, generatePrefixedCode } from "../utils/shortId.util.js";

const adminProfileSchema = new mongoose.Schema(
  {
    adminCode: {
      type: String,
      unique: true,
      index: true,
      immutable: true,
    },
    // Reference to auth user
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per admin user
      index: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      default: "",
    },



    department: {
      type: String,
      default: "",
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified : {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
);

adminProfileSchema.pre("validate", async function (next) {
  try {
    await assignUniqueCode(this, "adminCode", () =>
      generatePrefixedCode("ADM")
    );
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("AdminProfile", adminProfileSchema);
