const jwt = require("jsonwebtoken");
const User = require('../model/user');
const {getOrSetCachedInfo} = require('../redis-config')
const authUser = async(req,res,next)=>{
    if(req.headers.authorization&&req.headers.authorization.startsWith("Bearer")){
        try{
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                res.status(401);
                throw new Error("User is not authorized!");
              }
            const decoded = jwt.verify(token,process.env.JWT_SECRET,{complete:true}).payload;
            console.log(decoded)
            req.user = await getOrSetCachedInfo(decoded.id,()=>User.findById(decoded.id).select("-password"))
            next();
        } catch (error) {
            console.log(error)
            res.status(401);
            next(error)
        }
    }
}

module.exports = authUser;

