/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////

var fs 					= require('fs');
var mysql 		 		= require('mysql');
var path 			    = require('path');
var secureRandom		= require('secure-random');
var multer  	 		= require('multer');
var moment				= require('moment');
var encryption   		= require('../../scripts/encryption.js');
var validationHelpers  = require('./validationHelpers.js');

var fileUploadUpdate   = require('./fileUploadUpdate.js');
var fileUploadMultiple = require('./fileUploadMultiple.js');

var storage =   multer.diskStorage({	
	destination: function (req, file, callback) {
		callback(null,path.join(__dirname,'/upload'));
	},
	filename: function (req, file, callback) {
		callback(null, file.fieldname + '-' + Date.now());
	}
});

var uploadInstance = multer({ storage : storage }).array('fileToUpload',10); // upload up to 10 files simultaneously

module.exports.fileUpload=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next){
		
		var result=validationHelpers.validUserAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}

		uploadInstance(req,res,function(err) {

			if(err) 
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}

			if ((!req.files) || (typeof req.files === 'undefined'))
			{
				// Returns 500 for any other error
				// - File not found
				return res.status(500).json({
					success: false,
					message: 'req.files object is invalid'
				});
			}
				
			if (req.files.length==0)
			{
				// Returns 400 if validation error
				// - File not found
				return res.status(400).json({
					success: false,
					message: 'File(s) not found'
				});
			}
			
			var user_id=encryption.decryptStr(req.verifiedJwt.body.sub);
			var query="SELECT ?? FROM ?? WHERE ??=? LIMIT 1";
			var table = ["user_id","user","user_id",user_id];
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
					// Returns 500 for any other error
					return res.status(500).json({
						success: false,
						message: 'Invalid credential'
					});
				}

				// if we want to update an existing one we will scan the first available file
				var fileToUpdateName=req.body.fileToUpdateName;
				if (fileToUpdateName!="")
				{
					// multiple update
					fileUploadUpdate.update(req,res,app,connection,rows[0].user_id,fileToUpdateName);
				}
				else // multiple upload
				{
					fileUploadMultiple.upload(req,res,app,connection,rows[0].user_id);
				}
			});
		});
	};
};