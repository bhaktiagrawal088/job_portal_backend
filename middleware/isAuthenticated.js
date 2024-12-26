import jwt from "jsonwebtoken";

const isAuthenticated = async(req,res,next) => {
    try {

        if (!process.env.SECRET_KEY) {
            return res.status(500).json({
                message: "Internal Server Error - Missing secret key",
                success: false,
            });
        }
        
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
        console.error("JWT verification error:", error.message);
        return res.status(401).json({
        message: "Unauthorized - Invalid token",
        success: false,
    })
}
}

export default isAuthenticated;