import { Job } from "../models/job.model.js";

export const PostJob = async(req,res) => {
    try {
        const {title, description, requirements, salary, location, jobType, experience, position , companyId} = req.body;
        const userId = req.id;

        if(!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId){
            return res.status(400).json({
                message: "Something is misssing . Please fill in all fields.",
                success : false,
            });
        }
        let existingJob = await Job.findOne({title:title})
        if(existingJob){
            return res.status(400).json({
                message : "You can't create same job",
                success : false
            })
        }

        const job  = await Job.create({
            title,
            description,
            requirements : requirements.split(","),
            salary : Number(salary),
            location,
            jobType,
            experienceLevel:experience,
            position,
            company : companyId,
            created_by : userId
        })


        return res.status(201).json({
            message: "Job posted successfully",
            job,
            success : true,
        })
    } catch (error) {
        console.error("Error posting job:", error);
        return res.status(500).json({
            message: "An error occurred while posting the job.",
            success: false,
            error: error.message,
        });
    }
}

export const getAllJobs = async(req,res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                {title : {$regex:keyword, $options : "i"}},
                {description : {$regex:keyword, $options : "i"}},

            ]
        }

        const jobs = await Job.find(query).populate({
            path : "company",
        }).sort({createdAt : -1});
        if(!jobs){
            return res.status(404).json({
                message: "Job not found",
                success : false
            })
        }
        return res.status(200).json({
            jobs,
            success : true,
        })
    } catch (error) {
        console.log(error);
        
    }
}

export const getJobById = async(req,res) => {
    try {
        const jobId = req.params.id;

        // Check if the jobId is a valid MongoDB ObjectId
        if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                message: "Invalid Job ID format",
                success: false,
            });
        }
        const job = await Job.findById(jobId).populate({
            path:"applications"
        });
        if(!job){
            return res.status(404).json({
                message : "Job not found",
                success : false,
            })
        }
        return res.status(200).json({
            job,
            success : true
        })
        
    } catch (error) {
        console.log(error);
        
    }
}

export const getAdminJobs = async(req,res) => {
    try {
        const adminId = req.id;
        const jobs = await Job.find({created_by: adminId}).populate({
            path : 'company'
        })
        if(!jobs && jobs.length === 0){
            return res.status(404).json({
                message : "No jobs found",
                success : false
            })
        }
        return res.status(200).json({
            jobs,
            success : true,
        })
    }   
    catch (error) {
        console.error("Error fetching admin jobs:", error);
        return res.status(500).json({
            message: "An error occurred while fetching jobs",
            success: false,
            error: error.message  // Optional: to send back the error message
        });
        
    }
}