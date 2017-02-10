/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////
var events = require('events');
var mysql = require('mysql');
var fs    = require("fs");

module.exports.fileDownload=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res,next){
		
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
					var query="SELECT ??,??,??,??,??,??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
					var table = ["f.file_id",
								 "f.file_name",
								 "f.creation_date",
								 "f.modification_date",
								 "f.file",
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
								var file_buffer = new Buffer(rows[0].file);
								var fileSize=rows[0].file_size;
								var mimeType=rows[0].mime_type;
								
								var now=Date.now();
								var download_path = __dirname +'/download/'+name; // +"-"+now;
								var download_name = name;
								
								// c
								fs.writeFile(download_path, file_buffer, function(err) {
								    if (err) 
								    {
										res.status(500).send(err);
								    }
								    else
								    {
										// Returns 200 if file has been generated
										res.statusCode=200;
										res.statusMessage="File has been generated"
										
										/************************************************************************************************************************/
										// download the file
										res.setHeader('Content-type', mimeType);
										res.setHeader('Content-disposition', 'attachment; filename="' + download_name+'"');
										res.download(download_path,download_name, function(err){
											if (err) 
											{
												res.status(500).send(err);
											} 
											else 
											{
												// remove file after download
												fs.unlink(download_path,function(err){
													if (err)
													{
													   // just log the error since the file was downloaded
													   console.log(err);
													} 
												});
											}
										});
										/************************************************************************************************************************/
										
										/************************************************************************************************************************
										// send the file
										var options = {
											root: __dirname + '/download/',
											dotfiles: 'deny',
											headers: {
												'Content-disposition': 'attachment; filename="' + download_name+'"',
												'Content-type': mimeType
											}
										};
										var fileName = name; // +"-"+now;
										res.sendFile(fileName, options, function (err) {
											if (err) 
											{
												next(err);
											} 
											else 
											{
												// remove file after download
												fs.unlink(download_path,function(err){
													if (err)
													{
													   // just log the error since the file was downloaded
													   console.log(err);
													} 
												});
											}
										});
										************************************************************************************************************************/
								    }
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