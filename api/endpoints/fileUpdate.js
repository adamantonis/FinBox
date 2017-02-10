/////////////////////////////////////////////////////////////////////////////////////////
// Update a file: This endpoint is used to update the contents of an existing file
/////////////////////////////////////////////////////////////////////////////////////////

var fs 			 = require('fs');
var mysql 		 = require('mysql');
var path 		 = require('path');
var multer  	 = require('multer');
var moment		 = require('moment');

var storage =   multer.diskStorage({	
	destination: function (req, file, callback) {
		callback(null,path.join(__dirname,'/upload'));
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});

var updateInstance = multer({ storage : storage }).single('fileToUpdate');

module.exports.fileUpdate=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){

		var isUserAuthenticated=req.verifiedJwt;
		if (isUserAuthenticated)
		{
			updateInstance(req,res,function(err) {

				if(err) 
				{
					// Returns 500 for any other error
					res.status(500).send(err);
				}
				else
				{
					if (!req.file)
					{
						// Returns 400 if validation error
						res.status(400).send("File not found");
					}
					else
					{
						var file_id=req.params.fileid;
						if (typeof file_id === 'undefined')
						{
							// Returns 500 for any other error
							res.status(500).send("fileid parameter is undefined");
						}
						else
						{
							var email=req.body.fileToUpdateEmail;
							if (typeof email === 'undefined')
							{
								// Returns 500 for any other error
								res.status(500).send("User email is undefined");
							}
							else
							{
								var query="SELECT ??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
								var table = ["f.file_id","f.user_id_fk",
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
											// Returns 500 for any other error
											res.status(500).send("The received email, and the fileid parameter did not match any files in the system");
										}
										else 
										{
											var file=req.file;
												
											var file_path=file.path;
												
											fs.open(file_path, 'r', function(err, fd) {
												if (err) 
												{
													// Returns 500 for any other error
													res.status(500).send(err);
												}
												else
												{
													var file_size=file.size;											
													var file_buffer = new Buffer(file_size);

													fs.read(fd, file_buffer, 0, file_size, 0, function(err, bytes){
														if (err)
														{
															// Returns 500 for any other error
															res.status(500).send(err);
														}
														else
														{
															if ((file_size/1000000)>1.024)
															{
																//Returns 400 if validation error
																// - File size cannot exceed 1MB
																res.status(400).send("File size cannot exceed 1MB");
															}
															else
															{
																var file_id = rows[0].file_id; // use from db
																var user_id_fk = rows[0].user_id_fk;
																var now = new Date();
																var modification_date = moment(now).format('YYYY-MM-DD HH:mm:ss');
																var file_name=file.originalname;
																var file_type=file.mimetype;
																																			
																var updateQuery="UPDATE ?? as f "+
																				"INNER JOIN ?? as u ON ??=?? "+
																				"SET ??=?, ??=?, ??=?, ??=?, ??=? "+
																				"WHERE ??=? AND ??=?";
																var updateTable = ["user_files",
																				   "user",
																				   "f.user_id_fk",
																				   "u.user_id",
																				   "f.file_name",file_name,
																				   "f.modification_date",modification_date,
																				   "f.file",file_buffer,
																				   "f.file_size",file_size,
																				   "f.mime_type",file_type,
																				   "u.user_id",user_id_fk,
																				   "f.file_id",file_id];
																updateQuery = mysql.format(updateQuery,updateTable);
																connection.query(updateQuery,function(err,updateRows){
																	if(err) 
																	{			
																		// Returns 500 for any other error
																		res.status(500).send(err);
																	} 
																	else 
																	{
																		console.log(updateRows.length);
																		// Returns 204 if file was updated
																		res.status(204).send("File was updated");
																	}
																});
															}
														}
														
														// close temp file
														fs.close(fd, function(err){
															if (err)
															{
															   // just log the error since the file was uploaded and saved to database
															   console.log(err);
															} 
															else
															{
																// remove temp file
																fs.unlink(file_path,function(err){
																	if (err)
																	{
																	   // just log the error since the file was uploaded and saved to database
																	   console.log(err);
																	} 
																});
															}
														});
													});
												}
											});
										}
									}
								});
							}
						}
					}
				}
			});
		}
		else
		{
			// Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");
		}
    };
};