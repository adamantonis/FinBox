var crypto = require("crypto");
var config = require('./config.js');

// method to encrypt a string
module.exports.encryptStr=function(str) 
{
    var cipher  = crypto.createCipher(config.password_encryption_algorithm,config.pea_private_key);
    var crypted = cipher.update(str,'utf8','hex');
    crypted    += cipher.final('hex');
    return crypted;
}

// method to dycrypt a string
module.exports.decryptStr=function(str) 
{
    var decipher = crypto.createDecipher(config.password_encryption_algorithm,config.pea_private_key);
    var dec 	 = decipher.update(str,'hex','utf8');
    dec 		+= decipher.final('utf8');
    return dec;
}