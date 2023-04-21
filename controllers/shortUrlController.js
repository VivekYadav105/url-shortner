const shortid = require("shortid")
const ShortUrl = require("../model/shortUrl")
const User = require("../model/user")
const {getOrSetCachedInfo, changeCachedInfo} = require("../redis-config")

module.exports.generateUrl = async(req,res,next)=>{
    try{
        const {originalUrl} = req.body
        if(!originalUrl) {
            res.status(400)
            throw new Error("original url is required")
        }
        if(!originalUrl) return res.sendStatus(400).json({message:"the url field is blank"})

        const prefix = req.get('origin')||req.get('host');
        const urlId = shortid.generate() + parseInt(Date.now() + Math.random()*1000);
        const url = prefix + "/" + urlId
        
        if(req.user.urls.length>10){
            res.status(429);
            throw new Error("User can add upto a maximum of 10 urls.\nPlease wait for an hour")
        }
        const shortUrl = new ShortUrl({url:url,originalUrl:originalUrl});
        await shortUrl.save();
        console.log(req.user._id)
        const user = await changeCachedInfo(req.user._id,async ()=>(
            await User.findByIdAndUpdate(req.user._id,{$push:{urls:shortUrl.id}}).select('-password')
            ))
        console.log(user)
        if(user==null ||user=={}){
            res.status(400);
            throw new Error("user with given id is not found");
        }
        return res.status(200)
                  .json({message:"the short url is genreated successfully",success:true,data:{newUrl:shortUrl.url,orignalUrl:shortUrl.originalUrl}});
    }
    catch(err){
        console.log(err)
        next(err)
    }
}

module.exports.getUrl = async(req,res,next)=>{
    try{
        let url = req.get('origin')||req.get('host')+"/"+req.params.url
        console.log(url)
        const urlObject = await ShortUrl.findOne({url:url})
        console.log(urlObject)
        if(!urlObject || urlObject=={}) {
            res.status(400)
            throw new Error("given url is Invalid")
        }
        res.redirect(urlObject.originalUrl); 
    }
    catch(err){
        if(res.status==200) res.status(500)
        next(err)
    }
}
