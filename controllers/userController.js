const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const {deleteCachedInfo,getOrSetCachedInfo} = require('../redis-config')

module.exports.signIn = async(req,res,next)=>{
    try{
        const {name,password} = req.body;
        if(!name || !password) {
            res.status(400)
            throw new Error("Both username and password fields are mandatory!!!")
        }

        const user = await User.findOne({name:name});
        
        if(!user){
            res.status(404);
            throw new Error("user or passowrd is incorrect")
        }
        const passwordCheck = await bcrypt.compare(password, user.password);
        if(!passwordCheck){
            res.status(400)
            throw new Error("user or password is incorrect")
        }

        const token = jwt.sign({id:user.id,name:user.name},process.env.JWT_SECRET,{expiresIn:process.env.TOKEN_EXPIRE})
        
        return res.status(200).json({message:"user logged in successfully",success:true,data:token})
    }
    catch(err){
        next(err)
    }
}

module.exports.signOut = async(req,res,next)=>{
    const data =await deleteCachedInfo(req.user._id);
    delete req.headers.authorization;
    delete req.user;
    res.status(200).json({
        success:true,
        message:"user logged out successfully",
        data:{}
    })
}

module.exports.signUp = async(req,res,next)=>{
    try{
        const {name,password,confirmPassword} = req.body;
        console.log(req.body)
        if(!name || !password){
            res.status(400)
            throw new Error("both username and password fields are mandatory!!")
        }
        if(confirmPassword&&confirmPassword!=password){
            res.status(400)
            throw new Error("passwords doesn't match")
        }
        const existingUser = await User.findOne({name:name})
        if(existingUser){
            res.status(409)
            throw new Error("user already exists")
        } 
        const user = new User({name:name,password:password});
        // if(!user.validatePassword(user.password)) {
        //     res.status(400)
        //     throw new Error("password should contain an uppercase letter\n a lowercase letter and a digit")
        // }
        await user.save();
        return res.status(200).json({message:"user created successfully",success:true,data:{
            user:user.name,
            message:"user is created successfully."
        }})
    }
    catch(err){
        next(err)
    }

}

