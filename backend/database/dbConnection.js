import mongoose from "mongoose";

const dbConnection = ()=>{
    mongoose.connect(process.env.MONGO_URI,{
        dbName:"PORTFOLIO",
    }).then(()=>{
        console.log("Database connected successfully");
    }).catch((error)=>{
        console.log(`Database connection failed with error: ${error}`);
    })
}

export default dbConnection;