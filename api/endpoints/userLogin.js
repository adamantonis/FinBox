/////////////////////////////////////////////////////////////////////////////////////
// Login a user: This endpoint is used to authenticate a registered user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 	   = require('mysql');
var nJwt     	 	   = require('njwt');
var validator    	   = require('validator');
var encryption   	   = require('../../scripts/encryption.js');
var verifyAPIRoute     = require("../verifyAPIRoute.js");
var validationHelpers = require("./validationHelpers.js");

module.exports.userLogin=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next) {
	  
		var result=validationHelpers.validLoginAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}
		
		var email=req.body.email;
		var checkQuery = "SELECT ??,?? FROM ?? WHERE ??=? LIMIT 1";
		var checkTable = ["user_id","user_password","user","user_email",email];
		checkQuery = mysql.format(checkQuery,checkTable);
		connection.query(checkQuery,function(err,checkRows) {	
			
			if(err) 
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			} 
			
			if (checkRows.length==0)
			{
				// Returns 401 if username is wrong
				return res.status(401).json({
					success: false,
					message: 'Username is wrong'
				});
			}
			
			var password=req.body.password;
			var userPassword=checkRows[0].user_password;
			userPassword=encryption.decryptStr(userPassword);
			if (userPassword!=password)
			{
				// Returns 401 if password is wrong
				return res.status(401).json({
					success: false,
					message: 'Password is wrong'
				});
			}

			verifyAPIRoute.applyToken(req,res,app,checkRows[0].user_id);

			// Returns 204 if authorized
			return res.status(204).json({
				success: true,
				message: 'Authorized'
			});
		});
	};
};