/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////

var fs 			 = require('fs');
var mysql 		 = require('mysql');
var path 		 = require('path');
var secureRandom = require('secure-random');
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

var uploadInstance = multer({ storage : storage }).array('fileToUpload',10); // upload up to 10 files simultaneously

module.exports.fileUpload=function(app,router,connection,opts){
	
    opts=opts || (opts = {});
  
    return function(req,res){
		
		var isUserAuthenticated=req.verifiedJwt;				
		if (isUserAuthenticated)
		{
			uploadInstance(req,res,function(err) {
	
				//console.log(req.body);
				
				//console.log(req.files);

				if(err) 
				{
					// Returns 500 for any other error
					res.status(500).send(err);
				}
				else
				{
					var email=req.body.fileToUploadEmail;
					if (typeof email === 'undefined')
					{
						// Returns 500 for any other error
						res.status(500).send("User email was not received by the endpoint");
					}
					else
					{
						if (!req.files)
						{
							// Returns 500 for any other error
							// - File not found
							res.status(500).send("Files could not be retrieved by the endpoint");
						}
						else
						{
							if (req.files.length==0)
							{
								// Returns 400 if validation error
								// - File not found
								res.status(400).send("File(s) not found");
							}
							else
							{
								var query="SELECT ?? FROM ?? WHERE ??=? LIMIT 1";
								var table = ["user_id","user","user_email",email];
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
											res.status(500).send("The received email could not be matched against any registered user in the system");
										}
										else 
										{
											// if we want to update an existing one we will scan the first available file
											var fileToUpdateName=req.body.fileToUpdateName;
											if (req.body.fileToUpdateName!="")
											{
												var files=req.files;
												
												var file_path=files[0].path;
													
												fs.open(file_path, 'r', function(err, fd) {
													if (err) 
													{
														// Returns 500 for any other error
														res.status(500).send(err);
													}
													else
													{
														var file_size=files[0].size;											
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
																	var user_id_fk = rows[0].user_id;
																	var now = new Date();
																	var modification_date = moment(now).format('YYYY-MM-DD HH:mm:ss');
																	var file_name=files[0].originalname;
																	var file_type=files[0].mimetype;
																																				
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
																					   "f.file_name",fileToUpdateName];
																	updateQuery = mysql.format(updateQuery,updateTable);
																	connection.query(updateQuery,function(err,updateRows){
																		if(err) 
																		{			
																			// Returns 500 for any other error
																			res.status(500).send(err);
																		} 
																		else 
																		{
																			// Returns 201 if file saved successfully
																			res.status(201).send("File saved successfully");
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
																	// remove any temp file(s)
																	for (var i=0; i<files.length; i++)
																	{
																		fs.unlink(files[i].path,function(err){
																			if (err)
																			{
																			   // just log the error since the file was uploaded and saved to database
																			   console.log(err);
																			} 
																		});
																	}
																}
															});
														});
													}
												});
											}
											else // multiple upload
											{
												var files=req.files;
												for (var i=0; i<files.length; i++)
												{
													var file_path=files[i].path;
													
													/*
													console.log("files["+i+"].fieldname="+files[i].fieldname);
													console.log("files["+i+"].originalname="+files[i].originalname);
													console.log("files["+i+"].encoding="+files[i].encoding);
													console.log("files["+i+"].mimetype="+files[i].mimetype);
													console.log("files["+i+"].size="+files[i].size);
													console.log("files["+i+"].destination="+files[i].destination);
													console.log("files["+i+"].filename="+files[i].filename);
													console.log("files["+i+"].path="+files[i].path);
													console.log("files["+i+"].buffer="+files[i].buffer);
													*/
													
													var arrAlways=[];
													var arrStatusCode=[];
													var arrStatusMessage=[];
													
													(function(x){
														setTimeout(function(){
															fs.open(file_path, 'r', function(err, fd) {
																if (err) 
																{
																	arrAlways.push(x);
																	arrStatusCode.push(500);
																	arrStatusMessage.push(err);
																	
																	//console.log(err);
																	
																	// Returns 500 for any other error
																	//res.status(500).send(err);
																}
																else
																{
																	var file_size=files[x].size;											
																	var file_buffer = new Buffer(file_size);

																	fs.read(fd, file_buffer, 0, file_size, 0, function(err, bytes){
																		if (err)
																		{
																			arrAlways.push(x);
																			arrStatusCode.push(500);
																			arrStatusMessage.push(err);
																			
																			//console.log(err);
																			
																			// Returns 500 for any other error
																			//res.status(500).send(err);
																		}
																		else
																		{
																			if ((file_size/1000000)>1.024)
																			{
																				arrAlways.push(x);
																				arrStatusCode.push(400);
																				arrStatusMessage.push("File size cannot exceed 1MB");
																			
																				//console.log("File size cannot exceed 1MB");
																				
																				// Returns 400 if validation error
																				// - File size cannot exceed 1MB
																				//res.status(400).send("File size cannot exceed 1MB");
																			}
																			else
																			{
																				var user_id_fk = rows[0].user_id;
																				var now = new Date();
																				var creation_date = moment(now).format('YYYY-MM-DD HH:mm:ss');
																				var file_name=files[x].originalname;
																				var file_type=files[x].mimetype;

																				var insertQuery = "INSERT INTO user_files SET ?";
																				var values = {
																								user_id_fk: user_id_fk,
																								file_name: file_name,
																								creation_date: creation_date,
																								file: file_buffer,
																								file_size: file_size,
																								mime_type: file_type
																				};
																				connection.query(insertQuery,values,function(err,insertRows){
																					if(err) 
																					{
																																																											arrAlways.push(x);
																						arrStatusCode.push(500);
																						arrStatusMessage.push(err);
																				
																						//console.log(err);
																						
																						// Returns 500 for any other error
																						//res.status(500).send(err);
																					} 
																					else 
																					{
																																																											arrAlways.push(x);
																						arrStatusCode.push(201);
																						arrStatusMessage.push("File saved successfully");
																				
																						//console.log("File saved successfully");
																						
																						// Returns 201 if file saved successfully
																						//res.status(201).send("File saved successfully");
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
																				fs.unlink(files[x].path,function(err){
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
														},100);
													})(i);

													var fileSavingCheckFunc=function(){
														
														if (arrAlways.length==files.length)
														{
															clearTimeout(global.fileSavingCheckTimer);
															
															var failedIndex400=-1;
															var failedIndex500=-1;
															for (var j=0; j<arrAlways.length; j++)
															{
																if (arrStatusCode[j]==400)
																{
																	failedIndex400=j;
																}
																if (arrStatusCode[j]==500)
																{
																	failedIndex500=j;
																}
															}
															
															// Priority is 400 as error so check it first
															if (failedIndex400!=-1)
															{
																// Returns xxx for any other error
																res.status(arrStatusCode[failedIndex400]).end(arrStatusMessage[failedIndex400]);
															}
															else if (failedIndex500!=-1)
															{
																// Returns xxx for any other error
																res.status(arrStatusCode[failedIndex500]).end(arrStatusMessage[failedIndex500]);
															}
															else
															{	
																// Returns 201 if file saved successfully
																res.status(201).end("File saved successfully");
															}
														}
														else
														{
															global.fileSavingCheckTimer=setTimeout(function(){ fileSavingCheckFunc(); },100);
														}
													};
													
													fileSavingCheckFunc();
												}
											}
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
			//Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");
		}
			
	};
};