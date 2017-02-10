/////////////////////////////////////////////////////////////////////////////////////
// Get logged on user details
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var encryption   = require('../../scripts/encryption.js');

module.exports.userDetails=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){
		
		var isUserAuthenticated=req.verifiedJwt;				
		if (isUserAuthenticated)
		{
			var email=req.query.email;
			if (typeof email === 'undefined')
			{
				// Returns 500 for any other error
				res.status(500).send("User email was not received by the endpoint");
			}
			else
			{
				var query="SELECT ??,??,?? FROM ?? WHERE ??=? LIMIT 1";
				var table = ["user_firstName","user_lastName","user_email","user","user_email",email];
				query = mysql.format(query,table);
				connection.query(query,function(err,rows){
					if(err) 
					{
						// Returns 500 for any other error
						res.status(500).send(err);
					}
					else
					{
						if (rows.length==0)
						{
							// Returns 500 for any other error
							res.status(500).send("The endpoint could not verify the email: "+email);
						}
						else 
						{
							// Returns 200 if user logged in and information retrieved
							res.statusCode = 200;
							res.statusMessage = "Logged in and information retrieved";

							res.json({
								"firstName": rows[0].user_firstName,
								"lastName":  rows[0].user_lastName,
								"email":     rows[0].user_email
							});
						}
					}
					
				});
			}
		}
		else
		{
			// Returns 404 if user not logged in
			res.status(404).send("User not logged in");
		}	
    };
};