const mongoose = require('mongoose')
const bcrypt = require('bcryptjs');
const { changeCachedInfo } = require('../redis-config');



const userSchema = mongoose.Schema({
    name:{type:String,trim:true,required:true,minLength:3},
    password:{type:String,required:true,minLength:6},
    urls:[{type:mongoose.SchemaTypes.ObjectId,ref:"shortUrl",default:[]}],
    createdAt:{type:Date,default:Date.now(),immutable:true},
    updatedAt:{type:Date,default:Date.now()}
})

userSchema.methods.validatePassword = ()=>{
    const user = this;
    const hasLowerCase = /[a-z]/.test(user.password);
    const hasUpperCase = /[A-Z]/.test(user.password);
    const hasNumber = /\d/.test(user.password);
    if(!(hasLowerCase&&hasUpperCase&&hasNumber)) return false
    return hasLowerCase&&hasUpperCase&&hasNumber 
}

userSchema.pre('save',function(next){
    const user = this;
        try{
            bcrypt.genSalt(process.env.SALT_FACTOR,function(err,salt){
                if(err) return next(err)
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                });
            });    
        }
        catch(err){
            console.log("inside catch block")
            next(err)
        }
    }
)

userSchema.pre('save',function(next){
    const user = this;
    console.log(this)
    if(user.isModified('name')){
        user.updatedAt = Date.now();
    }
    if(user.isModified('password')){
        try{
            // if(!user.validatePassword(user.password)) throw new Error("user password must contain atleast one uppercase\none lowercase and one number")
            bcrypt.genSalt(process.env.SALT_FACTOR,function(err,salt){
                if(err) return next(err)
                bcrypt.hash(user.password, salt, function(err, hash) {
                    if (err) return next(err);
                    user.password = hash;
                    next();
                });
            });    
        }
        catch(err){
            console.log("inside catch block")
            next(err)
        }
    }
    next();
})


userSchema.methods.comparePassword = function(password, next) {
    return bcrypt.compare(password, this.password, function(err, isMatch) {
        console.log(isMatch,password)
        if (err) return next(err);
        return isMatch;
    });
};



const User = mongoose.model('user',userSchema)

module.exports = User
