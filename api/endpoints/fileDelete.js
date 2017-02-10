/////////////////////////////////////////////////////////////////////////////////////
// Logout: This endpoint is used to log out a logged on authenticated user
/////////////////////////////////////////////////////////////////////////////////////

var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var encryption   = require('../../scripts/encryption.js');

module.exports.fileDelete=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){

		var file_id=req.params.fileid;
		if (typeof file_id === 'undefined')
		{
			// Returns 500 for any other error
			res.status(500).send("fileid parameter is undefined");
		}
		else
		{
			var email=req.body.fileToDeleteEmail;
			if (typeof email === 'undefined')
			{
				// Returns 500 for any other error
				res.status(500).send("User email is undefined");
			}
			else
			{
				var checkQuery="SELECT ??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
				var checkTable = ["f.user_id_fk",
								  "f.file_id",
								  "user_files",
								  "user",
								  "f.user_id_fk","u.user_id",
								  "u.user_email",email,
								  "f.file_id",file_id];
				checkQuery = mysql.format(checkQuery,checkTable);
				connection.query(checkQuery,function(err,checkRows){
					if(err) 
					{
						// Returns 500 for any other error
						res.status(500).send(checkQuery);
					}
					else
					{
						if (checkRows.length==0)
						{
							// Returns 400 if validation error
							// - File not found
							res.status(400).send("File not found");
						}
						else 
						{
							var deleteQuery="DELETE f "+
											"FROM ?? as f "+
											"INNER JOIN ?? as u ON ??=?? "+
											"WHERE ??=? AND ??=? AND ??=?";
							var deleteTable=["user_files",
											 "user",
											 "f.user_id_fk","u.user_id",
											 "u.user_email",email,
											 "f.file_id",checkRows[0].file_id,
											 "f.user_id_fk",checkRows[0].user_id_fk];
							deleteQuery = mysql.format(deleteQuery,deleteTable);
							connection.query(deleteQuery,function(err,deleteRows){
								if(err) 
								{
									// Returns 500 for any other error
									res.status(500).send(deleteQuery);
								}
								else
								{
									// Returns 204 if file was deleted
									res.status(204).send("File was deleted");
								}
							});
						}
					}
				});
			}
		}

    };
};