/////////////////////////////////////////////////////////////////////////////////////
// Logout: This endpoint is used to log out a logged on authenticated user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 	   = require('mysql');
var nJwt     	 	   = require('njwt');
var encryption   	   = require('../../scripts/encryption.js');
var verifyAPIRoute     = require("../verifyAPIRoute.js");
var validationHelpers  = require('./validationHelpers.js');

module.exports.userLogout=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next) {
		
		var result=validationHelpers.validUserAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}
		
		// set cookie to nothing
		verifyAPIRoute.setTokenToCookie(req,res,"");
		
		// remove Authorization header to remove token
		res.removeHeader('Authorization');		
		
		// Returns 204 if logged out successfully
		return res.status(204).json({
			success: true,
			message: 'Logged out successfully'
		});
    };
};