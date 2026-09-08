import express from "express" ;
import {z} from "zod" ;
import {prisma} from "../../lib/prisma.js" ;
import { authMiddleware } from "../../middleware/auth.js";

const adminRoutes = express.Router() ;

adminRoutes.post("/add_work_subCatogeries", authMiddleware,  async(req, res) => {
    const {workName, workType} = req.body ;
    const id = req.user?.id ;

    const validateInput = z.object({
        workName : z.string(),
        workType : z.string()
    })
    const verifyInput = validateInput.safeParse(req.body) ;

    if (!verifyInput.success || id == undefined){
        return res.json({
            success : false,
            msg : "UnAuthorized"
        })
    }

    try {
        const checkServiceExist = await prisma.service.findFirst({
            where : {
                name : workName,
                workerType : workType
            }
        })
        if (checkServiceExist){
            return res.json({
                success : false,
                msg : "Servce already Exist"
            })
        }

        const createService = await prisma.service.create({
            data : {
                name : workName,
                workerType : workType
            }
        })
        if (createService){
            return res.json({
                success : true,
                msg : "Service Create Successfully"
            })
        }
    } catch (error) {
        return res.json({
            success : false,
            msg : "Unable to Create Service"
        })
    }
})

export default adminRoutes ;