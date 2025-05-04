import express from "express"
import { isAuthenticated } from "../middlewares/auth.js"
import { deleteTimeLine, getAllTimelines, postTimeline } from "../controllers/timelineController.js"


const router = express.Router()

router.post("/add",isAuthenticated,postTimeline)
router.delete("/delete/:id",isAuthenticated,deleteTimeLine)
router.get("/getall",getAllTimelines)

export default router