import {User} from "../models/user.model.js"
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utilis/datauri.js";
import cloudinary from "../utilis/cloudinary.js";

export const register = async (req, res ) => {
    try {
        const {fullname, email, phoneNumber, password, role} = req.body;
        if(!fullname || !email || !phoneNumber || !password || !role){
            return res.status(400).json({
                message : "Something is missing",
                success : false
            })
        }

        let profilePhotoUrl = null; // Default value if no file is provided
        let originalFileName = null;

        const file = req.file;
        if (file) {
            const fileUri = getDataUri(file);
            const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            profilePhotoUrl = cloudResponse.secure_url; // Store Cloudinary URL
            originalFileName = file.originalname; // Store the original file name
        }

        const user = await User.findOne({email});
        if(user){
            return res.status(400).json({
                message: "User already exit with this email",
                success : false,

            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({
            fullname,
            email,
            phoneNumber,
            password : hashedPassword,
            role,
            profile: {
                Profile_Photo :profilePhotoUrl, // Store Cloudinary URL
                resumeOriginalName: originalFileName, // Store the original file name


            }
        })
        return res.status(201).json({
            message : "Account created successfully",
            success : true
        })

    } catch (error) {
        console.log(error);
        
    }
}

export const login = async (req, res) => {
    try {
        const {email, password, role} = req.body;
        if(!email || !password || !role){
            return res.status(201).json({
                message: "Something is missing",
                success : false
            })
        }
        // check is email is correct or not
        let user = await User.findOne({email});
        if(!user){
            return res.status(201).json({
                message : "Indirect email or password",
                success : false
            })
        }
        // check is password is correct or not
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch){
            return res.status(201).json({
                message : "Incorrect password. Please enter again",
                success : false,
            })
        }

        // check is role is correct or not
        if(role !== user.role){
            return res.status(201).json({
                message: "Account doesn't exit with current role",
                success : false,
            })
        }

        // create the token
        const tokenData = {
            userId : user._id
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY,{expiresIn: '1d'});
         
        user = {
            _id : user.id,
            fullname : user.fullname,
            email : user.email,
            phoneNumber : user.phoneNumber,
            role : user.role,
            profile: {
                ...user.profile,
                resumeOriginalName: user.profile.resumeOriginalName
              }

        }
        return res.status(200).cookie("token", token, {maxAge : 1*24*60*60*1000, httpsOnly: true, sameSite : "strict"}).json({
            message : `Welcome back ${user.fullname}`,
            user,
            success : true
        })


    } catch (error) {
        console.log(error);
        
    }
}

export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", {maxAge: 0}).json({
            message : "Logged out Successfully",
            success : true
        })
    } catch (error) {
       console.log(error);
        
    }
}

export const updateProfile = async (req,res) => {
    try {
        const {fullname, email, phoneNumber, bio, skills} = req.body;
        console.log(fullname, email, phoneNumber, bio, skills);
        
        const file = req.file;
        console.log("Uploaded file:", file); // Log req.file

        // if (!file) {
        //     return res.status(400).json({
        //         message: "No file uploaded",
        //         success: false
        //     });
        // }

        // if(!fullname || !email || !phoneNumber || !bio || !skill){
        //     return res.status(400).json({
        //         message : "Something is missing",
        //         success : false
        //     })
        // }

        //cloundinary
        let cloudResponse;
        if (file) {
            const fileUri = getDataUri(file);
            cloudResponse = await cloudinary.uploader.upload(fileUri.content);
            console.log("Cloudinary upload response:", cloudResponse);
        }

        let skillsArray
        if(skills){
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authencation
        let user  =  await User.findOne({_id : userId});
        if(!user){
            return res.status(400).json({
                message : "User not found",
                success : false
            })
        }

        // update data
        if(fullname) user.fullname = fullname;
        if(email) user.email = email;
        if(phoneNumber) user.phoneNumber = phoneNumber;
        if(bio)  user.profile.bio = bio;
        if(skillsArray) user.profile.skills = skillsArray;

        // resume

        if(cloudResponse){
            user.profile.resume= cloudResponse.secure_url // save the cloudinary 
            user.profile.resumeOriginalName = file.originalname;  // save the original file name
            

        }

        await user.save();

        user  = {
            _id : user._id,
            fullname : user.fullname,
            email : user.email,
            phoneNumber : user.phoneNumber,
            role : user.role,
            profile : user.profile
        }

        return res.status(200).json({
            message : "Profile updated successfully ",
            user,
            success : true
        })
        
    } catch (error) {
        console.log(error);
        
        
    }
}