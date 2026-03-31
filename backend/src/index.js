import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

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

/* ===============================
   Global Middlewares
================================ */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));

if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

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
    timestamp: new Date().toISOString()
  });
});

/* ===============================
   Error Handler (Last Middleware)
================================ */
app.use(errorHandler);

/* ===============================
   Database + Server Bootstrap
================================ */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log(process.env.MONGO_URI)
    
    await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: true
    });

    console.log("✅ MongoDB connected");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
