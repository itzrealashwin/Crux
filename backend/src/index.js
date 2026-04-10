import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import studentRoutes from "./routes/student.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import jobsRoutes from "./routes/jobs.routes.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import otpRoutes from "./routes/otp.routes.js";
import applicationRoute from "./routes/application.route.js";
import skillRoutes from "./routes/skill.routes.js";
import notificationRoutes from "./routes/notification.routes.js";

dotenv.config();

const app = express();

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173"].filter(
  Boolean,
);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: 429,
    message: "Too many attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message: {
    status: 429,
    message: "Too many OTP requests, please wait",
  },
});

const generalLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    status: 429,
    message: "Too many requests",
  },
});

/* ===============================
   Global Middlewares
================================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header (Postman/mobile clients).
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

app.use("/api", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/otp/send", otpLimiter);
app.use("/api/otp/verify", otpLimiter);

/* ===============================
   Routes
================================ */
app.use("/api/auth", authRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobsRoutes);
app.use("/api/applications", applicationRoute); // Applications routes
app.use("/api/skills", skillRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   Error Handler (Last Middleware)
================================ */
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// 1. Initiate MongoDB connection at the top level
mongoose
  .connect(process.env.MONGO_URI, {
    autoIndex: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((error) => console.error("❌ MongoDB connection failed:", error.message));

// 2. Only start the server manually if NOT in Vercel (production)
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running locally on port ${PORT}`);
  });
}

// 3. Export the app for Vercel Serverless Functions
export default app;
