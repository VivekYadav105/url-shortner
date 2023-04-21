const errorMiddleware = (err,req,res,next)=>{
    console.log("middle ware invoked")
    if(res.statusCode==200) res.statusCode=500;
    const errStatus = res.statusCode || 500;
    const errMessage = err.message||"something went wrong";
    const errStack = process.env.NODE_ENV==="development"? err.stack : {}
    res.status(errStatus).json({
        success:false,
        status:errStatus,
        stack:errStack,
        message:errMessage
    })
}

module.exports = errorMiddleware;