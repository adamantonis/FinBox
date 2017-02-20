/////////////////////////////////////////////////////////////////////////////////////////
// Update a file: This endpoint is used to update the contents of an existing file
/////////////////////////////////////////////////////////////////////////////////////////

var fs 		    		= require('fs');
var mysql 				= require('mysql');
var path 				= require('path');
var multer  			= require('multer');
var moment	    		= require('moment');
var encryption  		= require('../../scripts/encryption.js');
var fileHelpers 		= require('./fileHelpers.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

var storage =   multer.diskStorage({	
	destination: function (req, file, callback) {
		callback(null,path.join(__dirname,'/upload'));
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});

var updateInstance = multer({ storage : storage }).single('fileToUpdate');

module.exports.fileUpdate=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next) {

		var result=validationHelpers.validFileAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}
		
		updateInstance(req,res,function(err) {
			if(err) 
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}

			if ((!req.file) || (typeof req.file === 'undefined'))
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: 'req.file object is invalid'
				});
			}
			
			var file_id=req.params.fileid;
			var user_id=encryption.decryptStr(req.verifiedJwt.body.sub);
			var query="SELECT ??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
			var table = ["f.file_id","f.user_id_fk",
						 "user_files",
						 "user",
						 "f.user_id_fk","u.user_id",
						 "u.user_id",user_id,  
						 "f.file_id",file_id];
			query = mysql.format(query,table);
			connection.query(query,function(err,rows) {
				if(err) 
				{
					// Returns 500 for any other error
					return res.status(500).json({
						success: false,
						message: err
					});
				}

				if (rows.length==0)
				{
					// Returns 400 if validation error
					return res.status(400).json({
						success: false,
						message: 'File not found'
					});
				}

				var file=req.file;
				var file_path=file.path;
				// open the temp file
				fs.open(file_path, 'r', function(err, fd) {
					if (err) 
					{
						// close and remove the temp file
						fileHelpers.closeAndRemoveFile(fd,file_path);
							
						// Returns 500 for any other error
						return res.status(500).json({
							success: false,
							message: err
						});
					}

					var file_size=file.size;
					var file_buffer = new Buffer(file_size);
					// read the temp file
					fs.read(fd, file_buffer, 0, file_size, 0, function(err, bytes) {
						
						// close and remove the temp file
						fileHelpers.closeAndRemoveFile(fd,file_path);
							
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

							// Returns 204 if file was updated
							return res.status(204).json({
								success: true,
								message: 'File was updated'
							});
						});
					});
				});
			});
		});			
    };
};