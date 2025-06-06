import { v2 as cloudinary } from "cloudinary";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import { Skill } from "../models/skillsSchema.js";
import ErrorHandler from "../middlewares/error.js";



export const addNewSkill =  catchAsyncErrors(async (req,res,next) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return next(
          new ErrorHandler("Skill  Icon/svg Required", 400)
        );
      }
      const { svg } = req.files;
      const { title,proficiency } = req.body;
    
      if (!title || !proficiency) {
        return next(new ErrorHandler("Please fill full  form", 400));
      }
      const cloudinaryResponse = await cloudinary.uploader.upload(
        svg.tempFilePath,
        {
          folder: "PORTFOLIO_SKILLS_SVGS",
        }
      );
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        return next(new ErrorHandler("Error uploading avatar", 500));
      }

      const skill =  await Skill.create({title,proficiency, svg: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      }})
      res.status(200).json({
        success:true,
        message:"New Skill added",
        skill
      })
})

export const deleteSkill = catchAsyncErrors(async (req,res,next) => {
    
    const {id} = req.params
    const skill = await Skill.findById(id)
    if (!skill) {
        return next(new ErrorHandler("Skill not found",404))
    }
    const skillSvgId = skill.svg.public_id
    await cloudinary.uploader.destroy(skillSvgId)
    await skill.deleteOne()
    res.status(200).json({
        success:true,
        message:"Skill deleted"
    })
})


export const updateSkill = catchAsyncErrors(async (req,res,next) => {
    const {id} = req.params
    const skill = await Skill.findById(id)
    if (!skill) {
        return next(new ErrorHandler("Skill not found",404))
    }
    const {proficiency} = req.body
    skill = await Skill.findByIdAndUpdate(id,{proficiency},
        {
            new:true,
            runValidators:true,
            useFindAndModify:false
        }
    )
    res.status(200).json({
        success:true,
        message:"Skill updated",
        skill
    })
})

export const getAllSkills = catchAsyncErrors(async (req,res,next) => {
    const skills = await Skill.find()

    res.status(200).json({
        success:true,
        skills
    })
})