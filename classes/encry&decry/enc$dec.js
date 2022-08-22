const encKey = 'd5jLtMjs1a4v4l89bCCBCzQSonR0IIgI';
const crypto  = require('crypto');
module.exports.encrypation = (toCrypt)=>{
    return toCrypt;
    let keyBuf = Buffer.alloc(32);
    let ek =  encKey
    
    keyBuf.write(ek, 'utf8');
    let ivBuf = Buffer.alloc(16);

    
    let cipher = crypto.createCipheriv('aes256', keyBuf, ivBuf);
            
    output = cipher.update(JSON.stringify(toCrypt), 'utf-8', 'base64') + cipher.final('base64');
    return output;
}
module.exports.decryption = (request)=>{
    return request;
    let keyBuf = Buffer.alloc(32);
    let ek = encKey

    keyBuf.write(ek, 'utf8');

    let ivBuf = Buffer.alloc(16);

    let deCipher = crypto.createDecipheriv('aes256', keyBuf, ivBuf);

    try{ 
        decrypted = deCipher.update(request,'base64','utf8') + deCipher.final('utf8');
        return JSON.parse(decrypted);
    }catch(e){
        csl(request);
        console.log(e);
        return null;
    }
 }
