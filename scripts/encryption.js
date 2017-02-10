var crypto = require("crypto");
var config = require('./config.js');

// method to encrypt password
module.exports.encryptPassword=function(password) 
{
    var cipher  = crypto.createCipher(config.password_encryption_algorithm,config.pea_private_key);
    var crypted = cipher.update(password,'utf8','hex');
    crypted    += cipher.final('hex');
    return crypted;
}

// method to dycrypt password
module.exports.decryptPassword=function(password) 
{
    var decipher = crypto.createDecipher(config.password_encryption_algorithm,config.pea_private_key);
    var dec 	 = decipher.update(password,'hex','utf8');
    dec 		+= decipher.final('utf8');
    return dec;
}