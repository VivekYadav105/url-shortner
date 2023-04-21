const mongoose = require("mongoose")
const shortUrlSchema = mongoose.Schema({
    url:{type:String,required:true},
    originalUrl:{type:String,required:true},
    createdAt:{type:Date,default:Date.now(),immutable:true}
})

// shortUrlSchema.methods.validateUrl = ()=>{
//     var urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
// 	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
// 	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
// 	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
// 	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
// 	    '(\\#[-a-z\\d_]*)?$','i');

//       return !!urlPattern.test(this.originalUrl);

// } 

shortUrlSchema.pre('save',function(next){
    try{
        // const validate = this.validateUrl();
        // if(!validate) throw new Error("Invalid url Type");
        next();
    }
    catch(err){
        next(err);
    }

})


const ShortUrl = mongoose.model('shortUrl',shortUrlSchema)

module.exports = ShortUrl
