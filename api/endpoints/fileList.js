/////////////////////////////////////////////////////////////////////////////////////
// Get file lists
/////////////////////////////////////////////////////////////////////////////////////

var mysql  = require('mysql');
var moment = require('moment');

module.exports.fileList=function(app,router,connection,opts){
	
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
				var query="SELECT ??,??,??,??,??,?? FROM ?? as u INNER JOIN ?? as f ON ??=?? WHERE ??=?";
				var table = ["f.file_id",
							 "f.file_name",
							 "f.creation_date",
							 "f.modification_date",
							 "f.file_size",
							 "f.mime_type",
							 "user",
							 "user_files",
							 "u.user_id",
							 "f.user_id_fk",
							 "u.user_email",
							 email];
				query = mysql.format(query,table);
				connection.query(query,function(err,rows){
					if(err) 
					{
						
						console.log(query);
						
						// Returns 500 for any other error
						res.status(500).send(err);
					}
					else
					{
						var file_list = [];
						for (var i = 0;i < rows.length; i++) 
						{
							var id=rows[i].file_id;
							var name=rows[i].file_name;
							var creationDate=rows[i].creation_date;
							var modificationDate=rows[i].modification_date;
							var fileSize=rows[i].file_size;
							var mimeType=rows[i].mime_type;
							
							// Preprocess the fields
							creationDate=moment(creationDate).format('YYYY-MM-DD HH:mm:ss');
							modificationDate=modificationDate?moment(modificationDate).format('YYYY-MM-DD HH:mm:ss'):"";
							fileSize=Math.round(fileSize/1000), // in KBs
							
							file_list.push({
								"id": 				id,
								"name":  			name,
								"creationDate": 	creationDate,
								"modificationDate": modificationDate,
								"fileSize": 		fileSize,
								"mimeType": 		mimeType
							});
						}
						
						// Returns 200 if list is retrieved
						
						res.statusCode=200;
						res.statusMessage="File list is retrieved";
						
						res.json(file_list);
					}
				});
			}
		}
		else
		{
			//Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");
		}
	};
};