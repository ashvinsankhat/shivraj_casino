setnx = async(keyName, secName, expire)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.setnx(keyName, secName,async function (err, resp) {
                expireKey(keyName, Number(expire));               		
                resolve(resp)
            });
        })
    }catch(e){
        console.log("sentNx : 1 : Exception :",e)

    }
}
get = async(keyName) => {
    try{
        return new Promise((resolve,reject)=>{
            redisClient.get(keyName,function(err, rData) {
                resolve(rData);
            });
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
expireKey = async(keyName, expire) => {
    try{
        return new Promise((resolve,reject)=>{
            redisClient.expire(keyName, Number(expire));               		
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
zscore = async(keyName, value)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.zscore(keyName, value, function (err, cPlayers) {
                resolve(cPlayers);
            }); 
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
hmset = async(jsonData)=>{
    try{
        return new Promise((resolve,reject)=>{
            csl("hmset : ",jsonData);
            redisClient.hmset(jsonData);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
hmsetKeys = async(keyName,jsonData)=>{
    try{
        return new Promise((resolve,reject)=>{
            csl("hmset : ",jsonData);
            redisClient.hmset(keyName,jsonData);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
hdel = async(keyName,removekeyName)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.hdel(keyName, removekeyName);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}

hgetall = async(keyName)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.hgetall(keyName, function (err, res) {
                resolve(res);
            })
        })
    }catch(e){
        console.log("hgetall : 1 : Exception :",e)
    }
}
hset = async(key, keyName, value)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.hset(key, keyName, value);		
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
zadd = async(bkeyName, value, keyName)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.zadd(bkeyName, value, keyName);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
zincrby = async(bkeyName, value, keyName)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.zincrby(bkeyName, value, keyName);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
decrby = async(keyName, value)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.decrby(keyName, value);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
incr = async(keyName)=>{
    try{
        return new Promise((resolve,reject)=>{
            redisClient.incr(keyName);
            resolve(true);
        })
    }catch(e){
        console.log("getSim : 1 : Exception :",e)
    }
}
del = async(keyName) => {
    try{
        return new Promise((resolve,reject)=>{
            redisClient.del(keyName);
            resolve(true);
        })
    }catch(e){
        console.log("sentNx : 1 : Exception :",e)

    }

}
module.exports = {
    setnx,
    del,
    hdel,
    get,
    expireKey,
    zscore,
    hmset,
    hmsetKeys,
    zadd,
    zincrby,
    incr,
    hset,
    decrby,
    hgetall
}