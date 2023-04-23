const jwt = require('jsonwebtoken');
const User = require('../model/user');
const bcrypt = require('bcryptjs');
const {deleteCachedInfo,getOrSetCachedInfo, client} = require('../redis-config');
const { validateEmail } = require('../utils/validator');

module.exports.signIn = async(req,res,next)=>{
    try{
        const {name,password,email} = req.body;
        if(!password && (!email || !name)) {
            res.status(400)
            throw new Error("Both username and password fields are mandatory!!!")
        }
        if(email&&!validateEmail(email)){
            res.status(400)
            throw new Error("Given email is not valid")
        }
        if(name&&name.length<3){
            res.status(400)
            throw new Error("Given email is not valid")
        }
        const user = await User.findOne({$or:[{name:name},{email:email}]});
        
        if(!user){
            res.status(404);
            throw new Error("username/email or passowrd is incorrect")
        }
        const passwordCheck = await bcrypt.compare(password, user.password);
        if(!passwordCheck){
            res.status(400)
            throw new Error("user/email or password is incorrect")
        }

        const token = jwt.sign({id:user.id,name:user.name},process.env.JWT_SECRET,{expiresIn:process.env.TOKEN_EXPIRE})
        
        return res.status(200).json({message:"user logged in successfully",success:true,data:{token}})
    }
    catch(err){
        next(err)
    }
}

module.exports.signOut = async(req,res,next)=>{
    const data = await deleteCachedInfo(req.session.user._id);
    delete req.headers.authorization;
    delete req.session;
    return res.status(200).json({
        success:true,
        message:"user logged out successfully",
        data:{}
    })
}

module.exports.signUp = async(req,res,next)=>{
    try{
        const {name,password,confirmPassword,email} = req.body;
        if(!name || !password){
            res.status(400)
            throw new Error("both username and password fields are mandatory!!")
        }
        if(confirmPassword&&confirmPassword!=password){
            res.status(400)
            throw new Error("passwords doesn't match")
        }
        if(!validateEmail(email)){
            res.status(400)
            throw new Error("Given email is not valid")
        }
        if(name.length<3){
            res.status(400)
            throw new Error("user name should contain atlease 3 chracter")
        }
        const existingUser = await User.findOne({$or:[{name:name},{email:email}]})
        if(existingUser){
            res.status(409)
            throw new Error("user already exists")
        } 
        const user = new User({name:name,password:password,email:email});
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

