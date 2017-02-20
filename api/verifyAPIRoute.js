//////////////////////////////
// Used to validate all routes
//////////////////////////////

var nJwt 	           = require('njwt');
var mysql 	           = require('mysql');
var validator          = require('validator');
var uuid 			   = require('node-uuid');
var cookie 		   	   = require( "cookies");
var encryption 		   = require('../scripts/encryption.js');
var validationHelpers  = require('./endpoints/validationHelpers.js');

var verification={
	generateToken: function(app,user_id) {
		var xsrfToken=encryption.encryptStr(uuid.v1());
		var claims = {
			iss: 	   encryption.encryptStr(user_id.toString()),
			sub: 	   encryption.encryptStr(user_id.toString()),
			xsrfToken: xsrfToken,
			jti:  	   uuid.v4()
		};
		var jwt   = nJwt.create(claims,app.get('nJWTsk'),app.get('nJWTalg'));
		jwt.setExpiration(new Date().getTime() + (20*60*1000)); // valid for 20m
		var token = jwt.compact();
		
		token=encryption.encryptStr(token);
		
		return {
				token,
				xsrfToken
		};
	},
	setTokenToCookie: function(req,res,token) {
		new cookie(req,res).set('finbox_token',token,{
		  httpOnly: true,
		  secure: false
		});
	},
	getTokenFromCookie: function(req,res) {
		return new cookie(req,res).get('finbox_token');
	},
	applyToken: function(req,res,app,user_id)
	{
		var tokenObj=this.generateToken(app,user_id);
		this.setTokenToCookie(req,res,tokenObj.token);
		res.setHeader('Authorization','Bearer '+tokenObj.xsrfToken);
	},
	exitVerification: function(res,req) {
		// set cookie to nothing
		this.setTokenToCookie(req,res,"");
		
		// remove Authorization header to remove token
		res.removeHeader('Authorization');	
		
		// Returns 403 if user not authenticated
		return res.status(403).json({
			success: false,
			message: 'User not authenticated'
		});
	},
	verifyToken: function(app,router,connection,opts) {
	
		opts=opts || (opts = {});
		
		var self=this;
		
		return function(req,res,next) {
			
			// Other than the register and auth endpoints all other endpoints can only be accessed by authenticated users
			if ((req.url === '/auth') || (req.url === '/users') || (req.url === '/favicon.ico')) // and the annoying favicon
			{
				return next();
			}

			// get the authorization header and check if it is not defined
			var authorization=req.headers.authorization;
			if ((!authorization) || (typeof authorization === 'undefined'))
			{
				return self.exitVerification(res,req);
			}

			// check if the authorization header contains a space which sort of means that the bearer xsrfToken is maybe present
			// I check this so that the split in the next step does not fall over
			if (authorization.indexOf(' ')==-1)
			{
				return self.exitVerification(res,req);
			}

			// gets the bearer token to check if it has been provided
			var xsrfToken=authorization.split(' ')[1];
			if ((!xsrfToken) || (typeof xsrfToken === 'undefined'))
			{
				return self.exitVerification(res,req);
			}

			// checks if the length of the xsrfToken is invalid
			if (xsrfToken.trim().length===0)
			{
				return self.exitVerification(res,req);
			}
			
			// decrypt xsrfToken
			try
			{
				// if the xsrfToken has been forged and has invalid content for crypto to process 
				// then without the try catch, the decrypt may fail and so the system may go down
				xsrfToken=encryption.decryptStr(xsrfToken);
			}
			catch(e)
			{
				return self.exitVerification(res,req);
			}
			
			// get the actual token from the cookie
			var token=verification.getTokenFromCookie(req,res);
			if ((!token) || (typeof token === 'undefined') || (token === ''))
			{
				return self.exitVerification(res,req);
			}
			
			// decrypt the actual token
			try
			{
				token=encryption.decryptStr(token);
			}
			catch(e)
			{
				return self.exitVerification(res,req);
			}
			
			// verify the actual token before getting into important api roots
			nJwt.verify(token,app.get('nJWTsk'),app.get('nJWTalg'),function(err,verifiedJwt){     
				if (err) 
				{
					return self.exitVerification(res,req);	
				}
				
				// decrypt the xsrfToken random uuid in the token
				var xsrfTokenInToken=verifiedJwt.body.xsrfToken;
				try
				{
					xsrfTokenInToken=encryption.decryptStr(xsrfTokenInToken);
				}
				catch(e)
				{
					return self.exitVerification(res,req);
				}
				
				// compare the xsrfToken in the token to xsrfToken coming from the request
				// if there is mismatch then exit
				if (xsrfTokenInToken!=xsrfToken)
				{
					return self.exitVerification(res,req);
				}
				
				var user_id=verifiedJwt.body.sub;
				try
				{
					user_id=encryption.decryptStr(user_id);
				}
				catch(e)
				{
					return self.exitVerification(res,req);
				}
				
				// it is possible that the user_id has been forged, particularly is not a positive integer number greater than 0, or it is some kind of command pattern etc
				var result=validationHelpers.validUserId(user_id);
				if (!result.valid)
				{
					return self.exitVerification(res,req);
				}
				
				// the token has been verified, so now we need to verify the user_id
				var query="SELECT ?? FROM ?? WHERE ??=? LIMIT 1";
				var table = ["user_id","user","user_id",user_id];
				query = mysql.format(query,table);
				connection.query(query,function(err,rows) {
					if(err) 
					{
						return self.exitVerification(res,req);
					}

					if (rows.length==0)
					{
						return self.exitVerification(res,req);
					}
					
					// Passed verification
					req.verifiedJwt=verifiedJwt;
					
					return next();
				});
			});
		};
	}
}

module.exports.generateToken	  = verification.generateToken;
module.exports.setTokenToCookie   = verification.setTokenToCookie;
module.exports.getTokenFromCookie = verification.getTokenFromCookie;
module.exports.applyToken	  	  = verification.applyToken;
module.exports.verifyToken	  	  = verification.verifyToken;