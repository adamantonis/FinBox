///////////////////////////////////////
// functions for processing user input
///////////////////////////////////////

var validator  = require('validator');
var encryption = require('../../scripts/encryption.js');

var validation={
	
	// checks contain both custom and library validation techniques to cover all possible scenarios
	
	isUserAuthenticated: function(req) { 
		
		if ((!req.verifiedJwt) || (typeof req.verifiedJwt === 'undefined'))
		{
			// Returns 403 if user not authenticated
			return {
				valid: false,
				statusCode: 403, 
				message: 'User not authenticated'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isFileIdValid: function(req) {
		
		var file_id=req.params.fileid;
		if ((!file_id) 								   || 
			(typeof file_id === 'undefined') 		   || 
			(typeof parseInt(file_id,10) !== 'number') || 
			(parseInt(file_id,10) <= 0) 			   || 
			(parseInt(file_id,10) > 2147483647) 	   ||
			(!validator.isNumeric(file_id)) 	       ||
			(!validator.isInt(file_id,{min:1,max:2147483647})))
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'fileid parameter is invalid'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isUserIdValid: function(user_id) {
		
		if ((!user_id) 								   || 
			(typeof user_id === 'undefined') 		   || 
			(typeof parseInt(user_id,10) !== 'number') || 
			(parseInt(user_id,10) <= 0) 			   ||
			(parseInt(user_id,10) > 2147483647) 	   ||			
			(!validator.isNumeric(user_id)) 	       ||
			(!validator.isInt(user_id,{min:1,max:2147483647})))
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'user_id is invalid'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isFirstNameValid: function(req) {
		
		var firstName=req.body.firstName;
		if ((!firstName) 					        		  	|| 
		    (typeof firstName === 'undefined')      		  	|| 
			(typeof firstName !== 'string')         		  	||
			(firstName.trim().length===0) 	        		  	|| 
			(firstName.trim().length>64) 	        		  	|| 
			(validator.isEmpty(firstName))	   				  	||
			(!validator.isAlpha(firstName))	   				  	||
			(!validator.isAlpha(validator.escape(firstName))) 	||
			(!validator.isAlpha(validator.unescape(firstName))) ||
			(!validator.isLength(firstName,{min:1,max:64})))
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'First name is invalid'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isLastNameValid: function(req) {
		
		var lastName=req.body.lastName;
		if ((!lastName) 					  				   || 
		    (typeof lastName === 'undefined') 				   || 
		    (typeof lastName !== 'string')    				   ||
			(lastName.trim().length===0)      				   ||
			(lastName.trim().length>64) 	  				   ||
		    (validator.isEmpty(lastName))	  				   ||
			(!validator.isAlpha(lastName))	  				   ||
			(!validator.isAlpha(validator.escape(lastName)))   ||
			(!validator.isAlpha(validator.unescape(lastName))) ||
			(!validator.isLength(lastName,{min:1,max:64})))
			
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'Last name is invalid'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isEmailValid: function(req) {
		
		var email=req.body.email;
		if ((!email) 					   || 
		    (typeof email === 'undefined') || 
			(typeof email !== 'string')    || 
			(email.trim().length<5) 	   ||
			(email.trim().length>64) 	   ||
			(!validator.isEmail(email))    ||
		    (validator.isEmpty(email))     ||
			(!validator.isLength(email,{min:5,max:64})))
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'Email is invalid'
			};
		}
		
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	},
	isPasswordValid: function(req) {
		
		var password=req.body.password;
		if ((!password) 					  || 
		    (typeof password === 'undefined') || 
			(typeof password !== 'string')    ||
			(password.trim().length<8)        || 
			(password.trim().length>60) 	  ||
			(validator.isEmpty(password))     ||
			(!validator.isLength(password,{min:8,max:60})))
		{
			// Returns 500 for any other error
			return {
				valid: false,
				statusCode: 500, 
				message: 'Password is invalid'
			};
		}
		return {
			valid: true,
			statusCode: 200,
			message: 'OK'
		};
	}
};
		
module.exports.validUserAction=function(req) {
	
	var isUserAuthenticated=validation.isUserAuthenticated(req);
	if (!isUserAuthenticated.valid) return isUserAuthenticated;

	return {
		valid: true,
		statusCode: 200,
		message: 'OK'
	};
};

module.exports.validFileAction=function(req) {

	var isUserAuthenticated=validation.isUserAuthenticated(req);
	if (!isUserAuthenticated.valid) return isUserAuthenticated;
	
	var isFileIdValid=validation.isFileIdValid(req);
	if (!isFileIdValid.valid)       return isFileIdValid;
	
	return {
		valid: true,
		statusCode: 200,
		message: 'OK'
	};
};

module.exports.validUserId=function(user_id) {
	
	var isUserIdValid=validation.isUserIdValid(user_id);
	if (!isUserIdValid.valid) return isUserIdValid;

	return {
		valid: true,
		statusCode: 200,
		message: 'OK'
	};
};

module.exports.validRegisterAction=function(req) {

	var isFirstNameValid=validation.isFirstNameValid(req);
	if (!isFirstNameValid.valid) return isFirstNameValid;
	
	var isLastNameValid=validation.isLastNameValid(req);
	if (!isLastNameValid.valid) return isLastNameValid;
	
	var isEmailValid=validation.isEmailValid(req);
	if (!isEmailValid.valid) return isEmailValid;
	
	var isPasswordValid=validation.isPasswordValid(req);
	if (!isPasswordValid.valid) return isPasswordValid;
	
	return {
		valid: true,
		statusCode: 200,
		message: 'OK'
	};
};

module.exports.validLoginAction=function(req) {

	var isEmailValid=validation.isEmailValid(req);
	if (!isEmailValid.valid) return isEmailValid;
	
	var isPasswordValid=validation.isPasswordValid(req);
	if (!isPasswordValid.valid) return isPasswordValid;
	
	return {
		valid: true,
		statusCode: 200,
		message: 'OK'
	};
};