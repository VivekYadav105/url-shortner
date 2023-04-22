const mongoose = require("mongoose")
const errorHandler = require('../middleware/errorMiddleWare')
const shortUrlSchema = mongoose.Schema({
    url:{type:String,required:true},
    originalUrl:{type:String,required:true},
    createdAt:{type:Date,default:Date.now(),immutable:true}
})


shortUrlSchema.pre('save',function(next){
    try{
        next();
    }
    catch(err){
        next(errorHandle(err));
    }

})


const ShortUrl = mongoose.model('shortUrl',shortUrlSchema)

module.exports = ShortUrl
