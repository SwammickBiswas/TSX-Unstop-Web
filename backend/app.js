import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import fileUpload from "express-fileupload"
import dbConnection from "./database/dbConnection.js"
import {errorMiddleware} from "./middlewares/error.js"
import messageRouter from "./router/messageRoute.js"
import userRouter from "./router/userRoutes.js"
import timelineRoutes from "./router/timelineRoutes.js"
import softwareApplicationRoutes from "./router/softwareApplicationRoutes.js"
import skillRoutes from "./router/skillRoute.js"
import projectRoutes from "./router/projectRoutes.js"

const app = express()
dotenv.config({path:"./config/config.env"})

app.use(cors({
    origin:[process.env.PORTFOLIO_URL , process.env.DASHBOARD_URL],
    methods:["GET","POST","PUT","DELETE"],
    credentials:true
}))

app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.use(fileUpload({
    useTempFiles:true,
    tempFileDir:"/tmp/",
}))

app.use("/api/v1/message", messageRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/timeline",timelineRoutes)
app.use("/api/v1/softwareapplication",softwareApplicationRoutes)
app.use("/api/v1/skill",skillRoutes)
app.use("/api/v1/project",projectRoutes)

dbConnection()
app.use(errorMiddleware)

export default app