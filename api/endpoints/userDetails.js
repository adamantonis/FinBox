/////////////////////////////////////////////////////////////////////////////////////
// Get logged on user details
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 		= require('mysql');
var nJwt     			= require('njwt');
var encryption   		= require('../../scripts/encryption.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

module.exports.userDetails=function(app,router,connection,opts) {
	
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

		var user_id=encryption.decryptStr(req.verifiedJwt.body.sub);
		var query="SELECT ??,??,?? FROM ?? WHERE ??=? LIMIT 1";
		var table = ["user_firstName","user_lastName","user_email","user","user_id",user_id];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows) {
			if(err) 
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}
			
			if (rows.length==0)
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: 'Invalid credential'
				});
			}
			
			verifyAPIRoute.applyToken(req,res,app,user_id);
			
			// Returns 200 if user logged in and information retrieved
			return res.status(200).json({
				firstName: rows[0].user_firstName,
				lastName:  rows[0].user_lastName,
				email:     rows[0].user_email
			});
		});
    };
};