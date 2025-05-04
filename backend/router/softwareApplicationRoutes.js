import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { addNewApplication, deleteApplications, getAllApplications } from "../controllers/softwareApplicationController.js"


const router = express.Router()

router.post("/add",isAuthenticated,addNewApplication)
router.delete("/delete/:id",isAuthenticated,deleteApplications)
router.get("/getall",getAllApplications)

export default router