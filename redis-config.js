const redis = require('redis')
const client = redis.createClient({
    url:process.env.REDIS_URI
})

function getOrSetCachedInfo(key,callback){
    return new Promise(async (resolve,reject)=>{
        try{
            if(!key || !callback) throw new Error("a call back and a key is required.")
            let data = await client.get(key)
            if(data) return resolve(JSON.parse(data))
            data = await callback();
            await client.setEx(key,3600,JSON.stringify(data))
            console.log(data)
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
            var data = await client.get(key)
            if(!data){
                throw new Error("given key doesn't hold any data")
            }
            data = JSON.parse(data)
            const ttl = await client.ttl(key)
            data = await callback()
            console.log(data)
            await client.setEx(key,ttl,JSON.stringify(data));
            return resolve(data);
        }
        catch(err){
            console.log(err)
            return reject(err)
        }
    })
}

function deleteCachedInfo(key){
    return new Promise((resolve,reject)=>{
        if(!key) reject("Key is required to delete the value")
        client.del(key,async(err,delKey)=>{
            if(err) return reject(err)
            if(delKey==0) return resolve("key doesn't exist to delete")
            return resolve("key deleted successfully")
        })
    })
}

module.exports = {client,getOrSetCachedInfo,changeCachedInfo,deleteCachedInfo}