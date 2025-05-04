import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto"

const userSchema = new mongoose.Schema({
    fullName:{
        type: String,
        required: [true, "Please enter your full name"],
    },
    email:{
        type: String,
        required: [true, "Please enter your email"],
        unique: true,
    },
    phone:{
        type: Number,
        required: [true, "Please enter your Number"],
    
    },
    aboutMe:{
        type: String,
        required: [true, "Please enter about you"],
    },
    password:{
        type: String,
        required: [true, "Please enter your password"],
        minLength: [8, "Password should be atleast 8 characters"],
        select:false
    },
    avatar:{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    resume:{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
    },
    portfolioURL:{
        type: String,
        required: [true, "Please enter your portfolio URL"],
    },
    githubURL:String,
    instagramURL:String,
    facebookURL:String,
    linkedInURL:String,
    twitterURL:String,
    resetPasswordToken:String,
    resetPasswordExpire:Date,
})

userSchema.pre("save",async function (next) {
    if (!this.isModified("password")) {
        next()
    }
    this.password = await bcrypt.hash(this.password, 10)

})
userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {expiresIn: process.env.JWT_EXPIRES_TIME})
}
userSchema.methods.getResetPasswordToken = function(){
    const resetToken = crypto.randomBytes(20).toString("hex")

    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex")
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000 
    return resetToken

}


export const User = mongoose.model("User", userSchema)