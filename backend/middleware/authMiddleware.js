import jwt from "jsonwebtoken";

export function authenticate(req,res,next){
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({
            message: "Access denied. No Token."
        });
    }

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        
        req.userId = decoded.userId;
        req.role = decoded.role;

        next();
    }
    catch (error){
        return res.status(401).json({
            message: "Invalid Token"
        })
    }
    
}