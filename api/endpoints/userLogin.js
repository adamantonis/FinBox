/////////////////////////////////////////////////////////////////////////////////////
// Login a user: This endpoint is used to authenticate a registered user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var encryption   = require('../../scripts/encryption.js');

module.exports.userLogin=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req, res) {
	  
		var email=req.body.email;
		var password=req.body.password;
		
		if ((typeof email === 'undefined') || (typeof password === 'undefined'))
		{
			// Returns 401 if username or password is wrong
			res.status(401).send("Username or password is wrong");
		}
		else
		{
			var checkQuery = "SELECT ??,?? FROM ?? WHERE ??=? LIMIT 1";
			var checkTable = ["user_id","user_password","user","user_email",email];
			checkQuery = mysql.format(checkQuery,checkTable);
			connection.query(checkQuery,function(err,checkRows){
				if(err) 
				{
					// Returns 500 for any other error
					res.status(500).send(err);
				} 
				else 
				{
					if (checkRows.length==0)
					{
						// Returns 401 if username is wrong
						res.status(401).send("Username is wrong");
					}
					else
					{
						
						var userPassword=checkRows[0].user_password;
						userPassword=encryption.decryptPassword(userPassword);
						if (userPassword!=password)
						{
							// Returns 401 if password is wrong
							res.status(401).send("Password is wrong");
						}
						else
						{
							// Authentication token here
							
							var claims = {
							  iss: 'http://www.finbox.com/',
							  sub: 'user'+checkRows[0].user_id,
							  permissions: 'view-files,upload-files,update-files,delete-files',
							  scope: 'users'
							};
							var jwt   = nJwt.create(claims,app.get('nJWTsk'),app.get('nJWTalg'));
							jwt.setExpiration(new Date().getTime() + (60*60*1000)); // 1h
							var token = jwt.compact();
							token=encryption.encryptPassword(token);
							
							res.setHeader('x-access-token',token);
							
							// Returns 204 if authorized
							res.statusCode = 204;						
							res.statusMessage ="Authorized";
							res.end();
						}
						
					}
					
				}
				
			});
			
		}
	};
	
};