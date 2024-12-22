import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    job : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job", // realtion between job and application
        required : true
    },
    applicant : {
        type  : mongoose.Schema.Types.ObjectId,
        ref : "User" , // relation between User and applicant
        required : true
    },
    status : {
        type : String,
        enum : ['pending', 'accepted', 'rejected'],
        default : 'pending',
        required :true
    }
},{timestamps: true})

export const Application = mongoose.model("Application", applicationSchema);