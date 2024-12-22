import jwt from "jsonwebtoken";

const isAuthenticated = async(req,res,next) => {
    try {
        const token = req.cookies?.token;
        if(!token){
            return res.status(401).json({
                message: "Unauthorized - No token provided",
                success : false,
            })
        }
        const decode = await jwt.verify(token, process.env.SECRET_KEY)
        if(!decode || !decode.userId){
            return res.status(401).json({
                message : "Invalid token",
                success : false
            })
        }
        req.id = decode.userId ; 
        console.log("Authenticated user ID:", req.id); // Check the value of req.id
        next();
    } catch (error) {
        console.log(error);
        
    }
}

export default isAuthenticated;