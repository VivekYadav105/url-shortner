const shortid = require("shortid")
const ShortUrl = require("../model/shortUrl")
const User = require("../model/user")
const {getOrSetCachedInfo, changeCachedInfo} = require("../redis-config")
const { validateUrl, validateShortUrl } = require("../utils/validator")

module.exports.generateUrl = async(req,res,next)=>{
    try{
        const {originalUrl} = req.body

        if(!originalUrl) {
            res.status(400)
            throw new Error("original url is required")
        }

        if(!validateUrl(originalUrl)){
            res.status(400)
            throw new Error("given url is invalid")
        }

        const prefix = req.get('origin')||req.get('host');
        const urlId = shortid.generate() + parseInt(Date.now() + Math.random()*1000);
        const url = prefix + "/" + urlId
        
        if(req.session.user.urls.length>10){
            res.status(429);
            throw new Error("User can add upto a maximum of 10 urls.\nPlease wait for an hour")
        }



        const shortUrl = new ShortUrl({url:url,originalUrl:originalUrl});
        await shortUrl.save();
        console.log(req.session.user._id)
        const user = await changeCachedInfo(req.session.user._id,async ()=>(
            await User.findByIdAndUpdate(req.session.user._id,{$push:{urls:shortUrl.id}}).select('-password')
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

module.exports.fetchUrl = async(req,res,next)=>{
    try{
        console.log("hello")
        let url = req.get('origin')||req.get('host')+"/"+req.params.shortId;
        // const regex = /^specific_string_pattern[e][A-Za-z0-9]{10}[0-9]{13}$/
        // console.log(url)
        // if(!regex.test(url)){
        //     res.status(400);
        //     throw new Error("Given url is invalid");
        // }
        const prefix = req.get('origin')||req.get('host');
        if(validateShortUrl(url.trim(),prefix)){
            res.status(400)
            throw new Error("Given Url is Invalid")
        } 
        const urlObject = await getOrSetCachedInfo(url,()=>ShortUrl.findOne({url:url}),set=true,setName="urls")
        console.log(urlObject)
        if(!urlObject || urlObject=={}) {
            res.status(404)
            throw new Error("No url is found with the given url")
        }
        return res.status(200).json({
            success:true,
            message:"url found successfully",
            data:urlObject
        })
    }
    catch(err){
        next(err)
    }
}
