import {Request, Response, NextFunction } from "express";
import {email, z} from "zod" ;
import {prisma} from "../lib/prisma.js" ;
import jwt from "jsonwebtoken" ;

export const authMiddleware = async (req : Request, res : Response, next : NextFunction) => {
    const token = req.headers.authorization ;

    const validateInput = z.object({
        token : z.string()
    })
    const verifyInput = validateInput.safeParse(req.body) ;

    if (!verifyInput.success || !token || token == undefined){
        return res.json({
            success : false,
            msg : "UnAuthorized"
        })
    }

    const JWT_SECRET = process.env.JWT_SECRET as string ;
    const decodeToken = jwt.verify(token, JWT_SECRET) ;

    if (decodeToken == null && !decodeToken) {
        return res.json({
            success : false,
            msg : "UnAuthorized"
        })
    }

    const user = await prisma.user.findFirst({
        where : {
            email : decodeToken as string
        }
    })

    if (user == null || !user){
        return res.json({
            success : false,
            msg : "User Not Found"
        })
    }
    req.user = {
        id : user.id,
        email : user.email
    } ;
    next() ;
}