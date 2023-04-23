const jwt = require("jsonwebtoken");
const User = require('../model/user');
const {getOrSetCachedInfo} = require('../redis-config')
const authUser = async(req,res,next)=>{
    
    try{
        if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
            try{
                const token = req.headers.authorization.split(" ")[1];  
                if (!token) {
                    res.status(401);
                    throw new Error("User is not authorized!");
                  }
                const decoded = jwt.verify(token,process.env.JWT_SECRET,{complete:true}).payload;
                console.log(decoded)
                req.session.user = await getOrSetCachedInfo(decoded.id,()=>User.findById(decoded.id).select("-password"))
                next();
            } catch (err) {
                if(err.message=="jwt expired") err.message = "session timed-out.\nplease login again."
                res.status(401);
                next(err)
            }
        }
        else{
            res.status(403)
            throw new Error("user token is not found") 
        }
    }
    catch(err){
        next(err)
    }

}

module.exports = authUser;

