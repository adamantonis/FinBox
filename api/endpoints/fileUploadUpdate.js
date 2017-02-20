/////////////////////////////////////////////////////////////////////////////////////////////////////
// part of Upload a file: This function is used to update one or multiple files during upload process
/////////////////////////////////////////////////////////////////////////////////////////////////////

var fs 			 	= require('fs');
var mysql 		 	= require('mysql');
var path 		 	= require('path');
var moment		 	= require('moment');
var fileHelpers  	= require('./fileHelpers.js');
var verifyAPIRoute  = require("../verifyAPIRoute.js");

module.exports.update=function(req,res,app,connection,user_id,fileToUpdateName) {
	
	var files=req.files;
	var file_path=files[0].path;
	
	// open the temp file
	fs.open(file_path, 'r', function(err, fd) {
		if (err) 
		{
			// Returns 500 for any other error
			return res.status(500).json({
				success: false,
				message: err
			});
		}

		var file_size=files[0].size;	
		var file_buffer = new Buffer(file_size);
		// read the temp file
		fs.read(fd, file_buffer, 0, file_size, 0, function(err, bytes) {
			
			// close the current temp file and remove all files
			fileHelpers.closeCurrentAndRemoveAllFiles(fd,files);
				
			if (err)
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}
										
			if (!fileHelpers.validFileSize(file_size))
			{
				//Returns 400 if validation error
				// - File size cannot exceed 1MB
				return res.status(400).json({
					success: false,
					message: 'File size cannot exceed 1MB'
				});
			}

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
							   "u.user_id",user_id,
							   "f.file_name",fileToUpdateName];
			updateQuery = mysql.format(updateQuery,updateTable);
			connection.query(updateQuery,function(err,updateRows) {
				if(err) 
				{			
					// Returns 500 for any other error
					return res.status(500).json({
						success: false,
						message: err
					});
				}
				
				verifyAPIRoute.applyToken(req,res,app,user_id);	
				
				// Returns 201 if file saved successfully
				return res.status(201).json({
					success: true,
					message: 'File(s) saved sucessfully'
				});
			});
		});
	});
};