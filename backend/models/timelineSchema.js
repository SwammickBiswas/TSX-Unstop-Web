import mongoose from "mongoose";

const timelineSchema = new mongoose.Schema({
    title:{
        type: String,
        required: [2, "Title required"],
    },
    description:{
        type: String,
        required: [2, "Description required"],
    },
    timeline:{
        from:{type:String,required:[true,"Timeline starting is required"]},
        to:String
    }
})

 export const Timeline = mongoose.model("Timeline", timelineSchema)