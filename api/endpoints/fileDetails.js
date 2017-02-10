/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////

var mysql = require('mysql');
var moment = require('moment');

module.exports.fileDetails=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){

		var isUserAuthenticated=req.verifiedJwt;
		if (isUserAuthenticated)
		{
			var file_id=req.params.fileid;
			if (typeof file_id === 'undefined')
			{
				// Returns 500 for any other error
				res.status(500).send("fileid parameter is undefined");
			}
			else
			{
				var email=req.query.email;
				if (typeof email === 'undefined')
				{
					// Returns 500 for any other error
					res.status(500).send("User email is undefined");
				}
				else
				{
					// we need the file_id and something unique from the user's table eg. email, i avoid sending user_id in the examples
					var query="SELECT ??,??,??,??,??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
					var table = ["f.file_id",
								 "f.file_name",
								 "f.creation_date",
								 "f.modification_date",
								 "f.file_size",
								 "f.mime_type",
								 "user_files",
								 "user",
								 "f.user_id_fk","u.user_id",
								 "u.user_email",email,
								 "f.file_id",file_id];
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
								// Returns 400 if validation error
								res.status(400).send("File not found");
							}
							else 
							{
								
								var id=rows[0].file_id;
								var name=rows[0].file_name;
								var creationDate=rows[0].creation_date;
								var modificationDate=rows[0].modification_date;
								var fileSize=rows[0].file_size;
								var mimeType=rows[0].mime_type;
								
								// Preprocess the fields
								creationDate=moment(creationDate).format('YYYY-MM-DD HH:mm:ss');
								modificationDate=modificationDate?moment(modificationDate).format('YYYY-MM-DD HH:mm:ss'):"";
								fileSize=Math.round(fileSize/1000), // in KBs
								
								// Returns 200 if file details are returned
								res.statusCode=200;
								res.statusMessage="File details are returned";
								
								res.json({
									"id": 				id,
									"name":  			name,
									"creationDate": 	creationDate,
									"modificationDate": modificationDate,
									"fileSize": 		fileSize,
									"mimeType": 		mimeType
								});
							}
						}
					});
				}
			}
		}
		else
		{
			// Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");
		}
	}
};