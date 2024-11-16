import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import express from "express";
import cors from "cors";
import { getLocalIPv4 } from "./utils/os";

const app = express();
import cookieParser from "cookie-parser";

// Apply middleware first
app.use(express.json());
app.use(cookieParser());

const Ipv4 = getLocalIPv4();
//Cors setup
app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`, `http://${Ipv4}:5173`,"https://tx15qzwm-5173.inc1.devtunnels.ms"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

// Import routes after applying middleware
import userRouter from "./routes/user-routes";
import roomRouter from "./routes/room-routes";
import documentRouter from "./routes/document-routes";


// Define routes after middleware
app.use("/api/v1/user", userRouter);
app.use("/api/v1/room", roomRouter);
app.use("/api/v1/document", documentRouter);


export default app;