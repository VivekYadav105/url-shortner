const Redis = require('ioredis')
const client = new Redis(process.env.REDIS_URI)

client.on("error", function(error) {
   console.error(error);
   // I report it onto a logging service like Sentry. 
});

client.on("connect",(err)=>{
    console.log("connected to database successfully.")
})

function getOrSetCachedInfo(key,callback,set=false){
    
    return new Promise(async (resolve,reject)=>{
        try{
            let data;
            if(!key || !callback) throw new Error("a call back and a key is required.")
            
            if(set) data = await client.hget(setName,JSON.stringify(key));
            else data = await client.get(JSON.stringify(key))

            if(data) return resolve(JSON.parse(data));
            data = await callback();

            if(set) await client.hset(setName,JSON.stringify(key),JSON.stringify(data),'EX',4800);
            else await client.set(JSON.stringify(key),JSON.stringify(data), 'EX', 3600);
                
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
            await client.set(JSON.stringify(key),JSON.stringify(data), 'EX', ttl);
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