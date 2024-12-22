import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";


export const ApplyJob = async(req,res) => {
    try {
        const UserId = req.id;
        const JobId = req.params.id;

        if(!JobId){
            return res.status(400).json({
                message : "Job Id is required",
                success : false,
            })
        }

        // check if the user is already applied or not
        const isApplied = await Application.findOne({job: JobId, applicant: UserId} );
        if(isApplied){
            return res.status(400).json({
                message : "You have already apply for this job",
                success : false
            })
        }
        
        const job = await Job.findById(JobId);
        if(!job){
            return res.status(404).json({
                message : "Job not found",
                success : false
            })
        }

        //create a new Appplication
        const newApplication = await Application.create({
            job : JobId,
            applicant : UserId
        })

        job.applications.push(newApplication._id);
        await job.save();
        return res.status(201).json({
            message :"Job applied successfully",
            success : true
        }) 
    } catch (error) {
        console.log(error);
        
    }
}

export const getAppliedJob = async(req,res) => {
    try {
        const UserId = req.id;
        const application = await Application.find({applicant:UserId}).sort({createdAt : -1}).populate({
            path : 'job',
            options : {sort:{createdAt: -1}},
            populate : {
                path : 'company',
                options: {sort:{createdAt:-1}},
            }
        });
        if(!application){
            return res.status(404).json({
                message : "No applied job ",
                success : false
            })
        }
        return res.status(200).json({
            application,
            success:true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

// how many users(Students) have applied for job --> This is for Admin
export const getApplicants = async(req,res) => {
    try {
        const JobId = req.params.id;
        const job = await Job.findById(JobId).populate({
            path : 'applications',
            options : {sort:{createdAt: -1}},
            populate: {
                path : "applicant"
            }
        })
        if(!job) {
            return res.status(404).json({
                message : "Job not found",
                success: false
            })
        }

        return res.status(200).json({
            job,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}

export const updateStatus = async(req,res) => {
    try {
        const {status} = req.body;
        const applicationId = req.params.id;
        if(!status){
            return res.status(400).json({
                message : "status is required",
                success: false,
            })
        }
        
        // find application  by applicantion id
        const application = await Application.findOne({_id : applicationId})
        if(!application){
            return res.status(404).json({
                message : "Application not found",
                success : false
            })
        }

        // update status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message : "Status updated successfully",
            success : true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

