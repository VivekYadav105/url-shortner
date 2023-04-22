const redis = require('redis')
const client = redis.createClient({
    url:process.env.REDIS_URI
})

function getOrSetCachedInfo(key,callback,options={}){
    console.log("hello")
    return new Promise(async (resolve,reject)=>{
        try{
            let data;
            if(!key || !callback) throw new Error("a call back and a key is required.")
            
            if(options.set) data = await client.hGet(options.setName,JSON.stringify(key));
            else data = await client.get(JSON.stringify(key))

            if(data) return resolve(JSON.parse(data));
            data = await callback();

            if(options.set) await client.hSet(options.setName,JSON.stringify(data));
            else await client.setEx(JSON.stringify(key),3600,JSON.stringify(data))
                
            return resolve(data) 
        }
        catch(err){
            console.log(err)
            return reject(err)
        }

    })
}



function changeCachedInfo(key,callback){
    return new Promise(async(resolve,reject)=>{
        try{
            var data = await client.get(JSON.stringify(key))
            if(!data){
                throw new Error("given key doesn't hold any data")
            }
            data = JSON.parse(data)
            const ttl = await client.ttl(JSON.stringify(key))
            data = await callback()
            await client.setEx(JSON.stringify(key),ttl,JSON.stringify(data));
            return resolve(data);
        }
        catch(err){
            console.log(err)
            return reject(err)
        }
    })
}

function deleteCachedInfo(key){
    return new Promise(async(resolve,reject)=>{
        try{
        if(!key) throw new Error("Key is required to delete the value")
        const delKey = await client.del(JSON.stringify(key))
        if(delKey==0) return resolve("data with id doesn't exist to delete")
        return resolve("data with id deleted successfully")
       
        }
        catch(err){
            console.log(err)
            return reject(err)
        }
    } 
)}

module.exports = {client,getOrSetCachedInfo,changeCachedInfo,deleteCachedInfo}