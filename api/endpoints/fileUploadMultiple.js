/////////////////////////////////////////////////////////////////////////////////////////////////////
// part of Upload a file: This function is used to upload one or multiple files during upload process
/////////////////////////////////////////////////////////////////////////////////////////////////////

var fs 			 = require('fs');
var mysql 		 = require('mysql');
var path 		 = require('path');
var moment		 = require('moment');
var fileHelpers  = require('./fileHelpers.js');

module.exports.upload=function(req,res,app,connection,user_id) {
	
	var arrAlways=[];
	var arrStatusCode=[];
	var arrStatusMessage=[];

	var files=req.files;
	for (var i=0; i<files.length; i++)
	{
		(function(x) {
			setTimeout(function() {
			
				var file_path=files[x].path;
				// open the temp file
				fs.open(file_path, 'r', function(err, fd) {
					if (err) 
					{
						// close and remove the temp file
						fileHelpers.RemoveFile(file_path);
							
						arrAlways.push(x);
						arrStatusCode.push(500);
						arrStatusMessage.push(err);
					}
					else
					{
						var file_size=files[x].size;
						var file_buffer = new Buffer(file_size);
						// read the temp file
						fs.read(fd, file_buffer, 0, file_size, 0, function(err, bytes) {
							
							// close and remove the temp file
							fileHelpers.closeAndRemoveFile(fd,file_path);
								
							if (err)
							{
								arrAlways.push(x);
								arrStatusCode.push(500);
								arrStatusMessage.push(err);
							}
							else
							{
								if (!fileHelpers.validFileSize(file_size))
								{
									arrAlways.push(x);
									arrStatusCode.push(400);
									arrStatusMessage.push("File size cannot exceed 1MB");
								}
								else
								{
									var now = new Date();
									var creation_date = moment(now).format('YYYY-MM-DD HH:mm:ss');
									var file_name=files[x].originalname;
									var file_type=files[x].mimetype;

									var insertQuery = "INSERT INTO user_files SET ?";
									var values = {
										user_id_fk: user_id,
										file_name: file_name,
										creation_date: creation_date,
										file: file_buffer,
										file_size: file_size,
										mime_type: file_type
									};
									connection.query(insertQuery,values,function(err,insertRows) {
										if(err) 
										{
											arrAlways.push(x);
											arrStatusCode.push(500);
											arrStatusMessage.push(err);
										} 
										else 
										{	arrAlways.push(x);
											arrStatusCode.push(201);
											arrStatusMessage.push("File saved successfully");
										}
									});
								}
							}
						});
					}
				});
			},100);
		})(i);
	}
	
	// check if the saving of all files has finished and respond accordingly
	fileHelpers.checkIfMultiUploadFinished(req,res,app,user_id,files,arrAlways,arrStatusCode,arrStatusMessage);
};