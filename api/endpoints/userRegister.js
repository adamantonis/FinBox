/////////////////////////////////////////////////////////////////////////////////////
// Register a user: This endpoint is used to register a new user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var encryption   = require('../../scripts/encryption.js');

module.exports.userRegister=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){
		
		var email=req.body.email;
		
		//console.log(email);
		
		if (typeof email !== 'undefined')
		{
			var checkQuery = "SELECT ?? FROM ?? WHERE ??=? LIMIT 1";
			var checkTable = ["user_email","user","user_email",email];
			checkQuery = mysql.format(checkQuery,checkTable);
			connection.query(checkQuery,function(err,checkRows){
				if(err) 
				{
					//console.log(checkQuery);
					
					// Returns 500 for any other error
					res.status(500).send(err);
				} 
				else 
				{
					if (checkRows.length>0) 
					{
						// Returns 400 if validation error
						// Email already exists
						res.status(400).send("Email already exists");
					}
					else 
					{
						var firstName=req.body.firstName;
						var lastName=req.body.lastName;
						var password=req.body.password;
						
						//console.log(firstName);
						//console.log(lastName);
						//console.log(password);

						if ((typeof firstName === 'undefined') ||
							(typeof lastName  === 'undefined') ||
							(typeof password  === 'undefined')) 
						{
							// Returns 400 if validation error
							// All fields are required
							res.status(400).send("All fields are required");
						}
						else 
						{
							var encrypted_password=encryption.encryptPassword(password);
							
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
							connection.query(insertQuery,function(err,insertRows){
								if(err) 
								{
									//console.log(insertQuery);
									
									// Returns 500 for any other error
									res.status(500).send(err);
								} 
								else 
								{
									// Returns 201 if user created successfully
									res.status(201).send("User created successfully");
								}
							});
						}
					}
				}
			});
		}
		else
		{
			// Returns 400 if validation error
			// All fields are required
			res.status(400).send("All fields are required");
		}
    };
};