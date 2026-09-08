import express from "express" ;
import {z} from "zod" ;
import {prisma} from "../../lib/prisma.js" ;
import { authMiddleware } from "../../middleware/auth.js";

const workerRoutes = express.Router() ;

workerRoutes.post("/create", authMiddleware, async (req, res) => {
    const {latitude, longitude, category, experience} = req.body ;
    const userId = req.user?.id ;

    const validateInput = z.object({
        latitude : z.float32(),
        longitude : z.float32(),
        category : z.string(),
        experience : z.int()
    })
    const verifyInput = validateInput.safeParse(req.body) ;

    if (!verifyInput.success || userId == undefined || !userId){
        return res.json({
            success : false,
            msg : "UnAuthorized"
        })
    }

    const existingWorker = await prisma.worker.findFirst({
        where : {
            userId : userId
        }
    })
    if (existingWorker) {
        return res.json({
            success : false,
            msg : "Worker Already Exist"
        })
    }

    try {
        const addWorker = await prisma.worker.create({
            data : {
                userId : userId,
                latitude,
                longitude,
                category,
                experience
            }
        })
        if (addWorker){
            return res.json({
                success : true,
                msg : "Worker Added"
            })
        }
    } catch (error) {
        return res.json({
            success : false,
            msg : "Worker Creation Error"
        })
    }
})

workerRoutes.post("/add_serices", authMiddleware, async (req, res) => {
    const {} = req.body ;
})


export default workerRoutes ;