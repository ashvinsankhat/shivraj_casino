const encKey = 'DFK8s58uWFCF4Vs8NCrgTxfMLwjL9WUySoyAgiejbAF3ioFD4dFf2JsK12';
const crypto  = require('crypto');
encrypation = (toCrypt)=>{
    // keyBuf = new Buffer(Array(32));
    let ek =  encKey
    
    keyBuf.write(ek, 'utf8');
    let iv = ek.slice(0, 16);
    
    let cipher = crypto.createCipheriv('aes256', ek, iv);
            
    output = cipher.update(JSON.stringify(toCrypt), 'utf-8', 'base64') + cipher.final('base64');
    return output;
}
decryption = async(request)=>{
    keyBuf = new Buffer(Array(32));
    let ek = encKey

    keyBuf.write(ek, 'utf8');
    ivBuf = new Buffer(Array(16));
    let ek =  encKey
    let iv = ek.slice(0, 16);

    let deCipher = crypto.createDecipheriv('aes256', ek, iv);
    
    try{ 
        decrypted = deCipher.update(request,'base64','utf8') + deCipher.final('utf8');
        return JSON.parse(decrypted);
    }catch(e){
        csl(request);
        console.log(e);
        return null;
    }
 }
module.exports = {
    Enc : encrypation,
    Dec : decryption
}