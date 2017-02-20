/////////////////////////////////////////////////////////////////////////////////////
// Register a user: This endpoint is used to register a new user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 	  = require('mysql');
var nJwt     	      = require('njwt');
var validator         = require('validator');
var encryption   	  = require('../../scripts/encryption.js');
var verifyAPIRoute    = require("../verifyAPIRoute.js");
var validationHelpers = require("./validationHelpers.js");

module.exports.userRegister=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next) {
		
		var result=validationHelpers.validRegisterAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}
		
		var email=req.body.email;
		var checkQuery = "SELECT ?? FROM ?? WHERE ??=? LIMIT 1";
		var checkTable = ["user_email","user","user_email",email];
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

			if (checkRows.length>0) 
			{
				// Returns 400 if validation error
				// Email already exists
				return res.status(400).json({
					success: false,
					message: 'Email already exists'
				});
			}
			
			var firstName=req.body.firstName;
			var lastName=req.body.lastName;
			var password=req.body.password;
			var encrypted_password=encryption.encryptStr(password);
			
			var insertQuery = "INSERT INTO ?? (??,??,??,??) VALUES(?,?,?,?)";
			var inserTable = ["user",
							  "user_firstName",
							  "user_lastName",
							  "user_email",
							  "user_password",
							  firstName,
							  lastName,
							  email,
							  encrypted_password];
			insertQuery = mysql.format(insertQuery,inserTable);
			connection.query(insertQuery,function(err,insertRows) {
				if(err) 
				{
					// Returns 500 for any other error
					return res.status(500).json({
						success: false,
						message: err
					});
				} 

				// Returns 201 if user created successfully
				return res.status(201).json({
					success: true,
					message: 'User created successfully'
				});
			});		
		});	
    };
};