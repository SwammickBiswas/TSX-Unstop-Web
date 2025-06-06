import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { User } from "../models/userSchema.js";
import { v2 as cloudinary } from "cloudinary";
import { generateToken } from "../utils/jwtToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";

export const registerUser = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return next(new ErrorHandler("Please upload your avatar", 400));
  }
  const { avatar, resume } = req.files;

  const cloudinaryResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    {
      folder: "AVATARS",
    }
  );
  if (!cloudinaryResponseForAvatar || cloudinaryResponseForAvatar.error) {
    return next(new ErrorHandler("Error uploading avatar", 500));
  }

  const cloudinaryResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    {
      folder: "MY_RESUME",
    }
  );
  if (!cloudinaryResponseForResume || cloudinaryResponseForResume.error) {
    return next(new ErrorHandler("Error uploading resume", 500));
  }

  const {
    fullName,
    email,
    password,
    aboutMe,
    phone,
    portfolioURL,
    githubURL,
    instagramURL,
    facebookURL,
    linkedInURL,
    twitterURL,
  } = req.body;
  const user = await User.create({
    fullName,
    email,
    password,
    aboutMe,
    phone,
    portfolioURL,
    githubURL,
    instagramURL,
    facebookURL,
    linkedInURL,
    twitterURL,
    avatar: {
      public_id: cloudinaryResponseForAvatar.public_id,
      url: cloudinaryResponseForAvatar.secure_url,
    },
    resume: {
      public_id: cloudinaryResponseForResume.public_id,
      url: cloudinaryResponseForResume.secure_url,
    },
  });
  generateToken(user, "User registered successfully", 201, res);
});

export const loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return next(new ErrorHandler("Please enter your email and password", 400));
    }
    const user =  await User.findOne({email}).select("+password")
    if (!user) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    const isPasswordMatched = await user.comparePassword(password);
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Invalid email or password", 401));
    }
    generateToken(user, "User logged in successfully", 200, res);
})
export const logoutUser = catchAsyncErrors(async (req, res, next) => {
    res.status(200).cookie("token", "", {
        expires: new Date(Date.now()),
        httpOnly: true,
    }).json({
        success: true,
        message: "Logged out successfully",
    })
})

export const getUser = catchAsyncErrors(async (req, res, next) => {
    const user =  await User.findById(req.user.id)
    res.status(200).json({
        success: true,
        user,
    })

})


export const updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        aboutMe: req.body.aboutMe,
        portfolioURL: req.body.portfolioURL,
        githubURL: req.body.githubURL,
        instagramURL: req.body.instagramURL,
        facebookURL: req.body.facebookURL,
        linkedInURL: req.body.linkedInURL,
        twitterURL: req.body.twitterURL,
    }
    if (req.files && req.files.avatar) {
        const avatar = req.files.avatar
        const user = await User.findById(req.user.id)
        const profileImageId = user.avatar.public_id
        await cloudinary.uploader.destroy(profileImageId)
        const cloudinaryResponse = await cloudinary.uploader.upload(
            avatar.tempFilePath,
            {
              folder: "AVATARS",
            }
          );
          newUserData.avatar = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          }
    }
    if (req.files && req.files.resume) {
        const resume = req.files.resume
        const user = await User.findById(req.user.id)
        const resumeId = user.resume.public_id
        await cloudinary.uploader.destroy(resumeId)
        const cloudinaryResponse = await cloudinary.uploader.upload(
            resume.tempFilePath,
            {
              folder: "MY_RESUME",
            }
          );
          newUserData.resume = {
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url,
          }
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {new:true,runValidators:true,useFindAndModify:false})
    res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user,
    })
})

export const updatePassword = catchAsyncErrors(async (req, res, next) => {
    const {currentPassword,newPassword,confirmNewPassword} = req.body
    if (!currentPassword || !newPassword || !confirmNewPassword) {
        return next(new ErrorHandler("Please enter all fields", 400))
        
    }
    const user = await User.findById(req.user.id).select("+password")
    const isPasswordMatched = await user.comparePassword(currentPassword)
    if (!isPasswordMatched) {
        return next(new ErrorHandler("Current password is incorrect", 400))
    }
    if (newPassword !== confirmNewPassword) {
        return next(new ErrorHandler("New password and confirm password do not match", 400))
        
    }
    user.password = newPassword
    await user.save()
    res.status(200).json({
        success:true,message:"Password updated"
    })
})

export const getUserForPortfolio = catchAsyncErrors(async (req, res, next) => {
    const id = "6813744353799bb0d92ab617"
    const user = await User.findById(id)
    res.status(200).json({
        success: true,
        user,
    })
})

export const forgotPassword = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findOne({email:req.body.email})
    if (!user) {
        return next(new ErrorHandler("User not found",404))
    }
    const resetToken = user.getResetPasswordToken()
    await user.save({validateBeforeSave:false})
    const resetPassword = `${process.env.DASHBOARD_URL}/password/reset/${resetToken}`
    const message = `Your reset password token is: \n\n ${resetPassword} \n\n If you've not requested for this please ignore it`
    try {
        await sendEmail({
            email: user.email,
            subject: "Password Portofolio Recovery",
            message,
        })
        res.status(200).json({
            success: true,
            message: `Email sent to ${user.email} successfully`,
        })

    } catch (error) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined
        await user.save()
        return next(new ErrorHandler(error.message, 500))
    }
})

export const resetPassword = catchAsyncErrors(async (req, res, next) => {
    const {token} = req.params
    const resetPasswordToken = crypto.createHash("sha256").update(token).digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: {$gt: Date.now()}
    })
    if (!user) {
        return next(new ErrorHandler("Reset password token is invalid or has expired", 400))
    }
    if (req.body.password !== req.body.confirmPassword) {
        return next(new ErrorHandler("Password does not match", 400))
        
    }
    user.password = req.body.password
    user.resetPasswordExpire = undefined
    user.resetPasswordToken = undefined
    await user.save()
    generateToken(user, "Password updated successfully", 200, res)
})