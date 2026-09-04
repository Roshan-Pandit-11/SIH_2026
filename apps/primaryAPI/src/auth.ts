import express from "express" ;
import {prisma} from "./lib/prisma.js" ;
import {success, z} from "zod" ;
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt" ;
import { sendOTP } from "./lib/email/sendOtp.js";

const authRoutes = express.Router() ;

authRoutes.post("/signup" , async (req, res) => {
    const data = req.body ;
    const {firstName, lastName, email, password} = data ;

    const validateInput = z.object({
        firstName : z.string(),
        lastName : z.string(),
        email : z.email(),
        password : z.string().min(6)
    })

    const verifyInput = validateInput.safeParse(data) ;

    if (!verifyInput.success){
        return res.json({
            success : false,
            msg : "Invalid data Form"
        })
    }

    // check email exist
    try {
        const checkEmailExit = await prisma.user.findFirst({
            where : {
                email : email
            }
        })
        if (checkEmailExit){
            return res.json({
                success : false,
                msg : "Email Already Exist"
            })
        }
    } catch (error) {
        return res.json({
            success : false,
            msg : "DataBase Error"
        })
    }

    // create User
    try {
        const hashedPass = await bcrypt.hashSync(password, 10) ;
        
        const user = await prisma.user.create({
            data : {
                firstName : firstName,
                lastName : lastName,
                email : email,
                password : hashedPass
            }
        })
    } catch (error) {
        return res.json({
            success : false,
            msg : "Unable to SignUp Try again"
        })
    }

    // send and store otp
    const otp = Math.floor(Math.random() * 900000).toString() ;
    const otpHash = await bcrypt.hashSync(otp, 5) ;
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) ;

    try {
        const storeOtp = await prisma.emailOtp.upsert({
            where : {
                email : email
            },
            update : {
                otpHash : otpHash,
                purpose : "EMAIL_VERIFY",
                expiresAt : expiresAt,
                attempts : 0
            },
            create : {
                email : email,
                otpHash : otpHash,
                purpose : "EMAIL_VERIFY",
                expiresAt : expiresAt,
                attempts : 0
            }
        })
        const sendOtp = await sendOTP(email, otp) ;
        if (storeOtp && !sendOtp.error){
            return res.json({
                success : true,
                msg : "Otp Sent to Email"
            })
        }
    } catch (error) {
        return res.status(500).json({
            success : false,
            message: "Signup failed",
        });
    }
})

authRoutes.post("/verify_signup_otp", async (req , res) => {
    const {email, otp} = req.body ;
    const validateInput = z.object({
        email : z.email(),
        otp : z.string()
    })

    const verifyOtp = validateInput.safeParse(req.body) ;
    if (!verifyOtp.success){
        return res.json({
            success : false,
            msg : "Invalid Credentials"
        })
    }

    const record = await prisma.emailOtp.findFirst({
        where : {
            email : email,
            purpose : "EMAIL_VERIFY"
        }
    }) ;
    if (record == null || !record){
        return res.json({
            success : false,
            msg : "Email Not Found"
        })
    }

    if (!record || record.expiresAt < new Date()) {
        return res.json({
            success : false,
            msg : "OTP Expired"
        })
    }

    const retriveOtp = bcrypt.compareSync(otp, record.otpHash) ;
    if (retriveOtp == true){
        const user = await prisma.user.update({
            where : {
                email : email
            }, 
            data : {
                emailVerify : true
            }
        })
        await prisma.emailOtp.delete({
            where : {
                id : record.id
            }
        }) ;
        return res.json({
            success : true,
            msg : "OTP Verified"
        })
    }else {
        return res.json({
            success : false,
            msg : "Invalid OTP"
        })
    }
})

authRoutes.post("/login", async (req, res) => {
    const {email, password} = req.body ;
    const validateInput = z.object({
        email : z.email(),
        password : z.string().min(6)
    })

    const verifyInput = validateInput.safeParse(req.body) ;
    if (!verifyInput.success){
        return res.json({
            success : false,
            msg : "Invalid Credentials"
        })
    }

    const checkUser = await prisma.user.findFirst({
        where : {
            email : email
        }
    }) ;
    if (checkUser == null || !checkUser){
        return res.json({
            success : false,
            msg : "Email Not Exist"
        })
    }

    const checkPass = await bcrypt.compareSync(password, checkUser.password) ;

    if (checkPass == true){
        const JWT_SECRET = process.env.JWT_SECRET as string ;
        const token = jwt.sign(checkUser.email, JWT_SECRET) ;

        return res.json({
            success : true,
            msg : "Login Successfully",
            token : token,
            user : {
                id : checkUser.id,
                firstName : checkUser.firstName,
                lastName : checkUser.lastName,
                email : email
            }
        })
    }else{
        return res.json({
            success : false,
            msg : "Incorrect Password"
        })
    }
})

authRoutes.post("/forgot_password", async(req, res) => {
    const {email} = req.body ;
    const validateInput = z.object({
        email : z.email()
    })

    const verifyInput = validateInput.safeParse(req.body) ;
    if (!verifyInput.success){
        return res.json({
            success : false,
            msg : "Invalid Credentials"
        })
    }

    // user check
    const user = await prisma.user.findFirst({
        where : {
            email : email
        }
    })
    if (user == null || !user){
        return res.json({
            success : false,
            msg : "Email Not Found"
        })
    }

    const otp = Math.floor(Math.random()*900000).toString() ;
    const hashOtp = bcrypt.hashSync(otp, 5) ;

    // store otp
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) ;
    try {
        const storeOtp = await prisma.emailOtp.upsert({
        where : {
            email : email
        },
        update : {
            otpHash : hashOtp,
            expiresAt : expiresAt,
            purpose : "PASSWORD_RESET",
            attempts : 0
        },
        create : {
            email : email,
            otpHash : hashOtp,
            purpose : "PASSWORD_RESET",
            expiresAt : expiresAt,
            attempts : 0
        }
    })

    const sendOtp = await sendOTP(email, otp) ;
    if (storeOtp && !sendOtp.error){
        return res.json({
            success : true,
            msg : "Otp Sent to Email"
        })
    }
    } catch (error) {
        return res.json({
            success : false,
            msg : "Something Went Wrong"
        })
    }
})

authRoutes.post("/verify_reset_otp", async (req , res) => {
    const {email, otp} = req.body ;
    const validateInput = z.object({
        email : z.email(),
        otp : z.string()
    })

    const verifyOtp = validateInput.safeParse(req.body) ;
    if (!verifyOtp.success){
        return res.json({
            success : false,
            msg : "Invalid Credentials"
        })
    }

    const record = await prisma.emailOtp.findFirst({
        where : {
            email : email,
            purpose : "PASSWORD_RESET"
        }
    }) ;
    if (record == null || !record){
        return res.json({
            success : false,
            msg : "Email Not Found"
        })
    }

    if (!record || record.expiresAt < new Date()) {
        return res.json({
            success : false,
            msg : "OTP Expired"
        })
    }

    const retriveOtp = bcrypt.compareSync(otp, record.otpHash) ;
    if (retriveOtp == true){
        const user = await prisma.user.update({
            where : {
                email : email
            }, 
            data : {
                emailVerify : true
            }
        })
        await prisma.emailOtp.delete({
            where : {
                id : record.id
            }
        }) ;
        return res.json({
            success : true,
            msg : "OTP Verified"
        })
    }else {
        return res.json({
            success : false,
            msg : "Invalid OTP"
        })
    }
})

authRoutes.post("/reset_password", async(req, res) => {
    const {email, password} = req.body ;
    const validateInput = z.object({
        email : z.email(),
        password : z.string().min(6)
    })

    const verifyInput = validateInput.safeParse(req.body) ;
    if (!verifyInput.success){
        return res.json({
            success : false,
            msg : "Invalid Credentials"
        })
    }

    const user = await prisma.user.findFirst({
        where : {
            email : email
        }
    }) ;
    if (user == null || !user){
        return res.json({
            success : false,
            msg : "Email Not Found"
        })
    } ;

    const hashedPass = await bcrypt.hashSync(password, 10) ;
    try {
        const updatePass = await prisma.user.update({
            where : {
                id : user.id
            },
            data : {
                password : hashedPass,
                emailVerify : true
            }
        })
        if (updatePass){
            return res.json({
                success : true,
                msg : "Password Updated"
            })
        }
    } catch (error) {
        return res.json({
            success : false,
            msg : "Database error"
        })
    }
})


export default authRoutes ;