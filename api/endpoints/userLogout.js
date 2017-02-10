/////////////////////////////////////////////////////////////////////////////////////
// Logout: This endpoint is used to log out a logged on authenticated user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var encryption   = require('../../scripts/encryption.js');

module.exports.userLogout=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){
		
		var isUserAuthenticated=req.verifiedJwt;
		if (isUserAuthenticated)
		{
			res.removeHeader('x-access-token');
			// Returns 204 if logged out successfully
			res.status(204).send("Logged out successfully");
		}
		else
		{
			res.removeHeader('x-access-token');
			// Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");
		}
    };
};