import {Company} from "../models/company.model.js"
import getDataUri from "../utilis/datauri.js"
import cloudinary from "../utilis/cloudinary.js"

export const registerCompany = async (req,res) => {
    try {
        const {companyName} = req.body;
        if(!companyName){
            return res.status(400).json({
                message: "Company Name is required",
                success : false
            })
        }

        let company = await Company.findOne({name:companyName})
        if(company){
            return res.status(400).json({
                message : "You can't register same company",
                success : false
            })
        }

        console.log("User ID in registerCompany:", req.id) // Add this line before creating the company

        company = await Company.create({
            name : companyName,
            userId : req.id,
        })

        return res.status(201).json({
            message : "Company registered successfully",
            company,
            success : true,

        })      
    } catch (error) {
        console.log(error);
        
    }
}

export const getCompany = async(req,res) => {
    try {
        const userId = req.id; //logged in user id
        if (!userId) {
            return res.status(400).json({
                message: "User ID is required",
                success: false
            });
        }
        // Find companies associated with the user
        const companies = await Company.find({userId});
        if(!companies){
            return res.status(400).json({
                message : "You don't have any company",
                success : false
            })
        }
        return res.status(200).json({
            companies,
            success : true
        })
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "An error occurred while fetching companies",
            success: false
        });   
    }
}

// get company by Id
export const getCompanyById = async(req,res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if(!company){
            return res.status(400).json({
                message : "Company not found",
                success : false
            })
        }
        return res.status(200).json({
            company,
            success : true
        })

        
    } catch (error) {
        console.log(error);
        
    }
}

export const updateCompany = async(req,res) => {
    try {
        const {name, description , website, location} = req.body;
        console.log(name, description, website, location);
        
        const file = req.file;
        let logo;
        
        // cloundinary
        if(file){
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content)
            logo = cloudResponse.secure_url
        }

        const updateData = {name, description, website , location};
        if(logo){
            updateData.logo = logo
        }
        const company = await Company.findByIdAndUpdate(req.params.id, updateData, {new:true});
        if(!company){
            return res.status(404).json({
                message : "Company not found",
                success : false,
            })
        }
        return res.status(200).json({
            message : "Company information updated",
            success : true,

        })
    } catch (error) {
        console.log(error);
        
    }
}