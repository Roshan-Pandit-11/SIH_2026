import express from "express";
import cors from "cors" ;
import { prisma } from "./lib/prisma.js";
import { sendOTP } from "./lib/email/sendOtp.js";
import { success } from "zod";

const app = express() ;

app.use(cors()) ;
app.use(express.json()) ;

app.get("/health", (req, res) => {
    return res.json({
        success : true ,
        message : "worker saas API"
    })
})

app.post("/add_user" , async (req, res) => {
    const data = req.body ;
    const {firstName, lastName, email} = data ;

    try {
        const user = await prisma.user.upsert({
            where : {
                email : email
            },
            update : {
                firstName : firstName,
                lastName : lastName,
            },
            create : {
                firstName : firstName,
                lastName : lastName,
                email : email
            }
        })
        return res.status(201).json({
            success : true,
            msg : user
        })
    } catch (error) {
        res.json({
            success : false,
            msg : error
        })
    }
})

app.post("/auth/send_otp", async (req, res) => {
    const {email} = req.body ;

    const checkEmail = await prisma.user.findFirst({
        where : {
            email : email
        }
    })
    if (checkEmail == null || !checkEmail) {
        return res.json({
            success : false,
            msg : "Email Not Found"
        })
    }

    const otp = Math.floor(Math.random()*900000).toString() ;

    const storeotp = await
    const response = await sendOTP(email, otp) ;
    if (response.message){
        return res.json({
            success : true ,
            msg : "OTP send successfully"
        })
    }else{
        return res.json({
            success : false,
            msg : response.error 
        })
    }
})

export default app ;