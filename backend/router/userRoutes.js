import express from 'express';

import {forgotPassword, getUser, getUserForPortfolio, loginUser, logoutUser, registerUser, resetPassword, updatePassword, updateProfile} from "../controllers/userController.js";
import { isAuthenticated } from '../middlewares/auth.js';


const router = express.Router()

router.post("/register", registerUser)
router.post("/login", loginUser)
router.get("/logout",isAuthenticated,logoutUser)
router.get("/me",isAuthenticated,getUser)
router.put("/update/me",isAuthenticated,updateProfile)
router.put("/update/password",isAuthenticated,updatePassword)
router.get("/me/portfolio",getUserForPortfolio)
router.post("/password/forget",forgotPassword)
router.post("/password/reset/:token",resetPassword)

export default router