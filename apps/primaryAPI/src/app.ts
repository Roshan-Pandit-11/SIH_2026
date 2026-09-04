import express from "express";
import cors from "cors" ;
import { prisma } from "./lib/prisma.js";
import { sendOTP } from "./lib/email/sendOtp.js";
import authRoutes from "./auth.js";

const app = express() ;

app.use(cors()) ;
app.use(express.json()) ;

app.use("/auth", authRoutes) ;

export default app ;