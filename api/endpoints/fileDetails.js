/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////

var mysql      			= require('mysql');
var moment     			= require('moment');
var encryption 			= require('../../scripts/encryption.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

module.exports.fileDetails=function(app,router,connection,opts) {
	
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
		
		var file_id=req.params.fileid;
		var user_id=encryption.decryptStr(req.verifiedJwt.body.sub);
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
			
			var id=rows[0].file_id;
			var name=rows[0].file_name;
			var creationDate=rows[0].creation_date;
			var modificationDate=rows[0].modification_date;
			var fileSize=rows[0].file_size;
			var mimeType=rows[0].mime_type;
			
			// Preprocess the fields
			creationDate=moment(creationDate).format('YYYY-MM-DD HH:mm:ss');
			modificationDate=modificationDate?moment(modificationDate).format('YYYY-MM-DD HH:mm:ss'):"";
			fileSize=Math.round(fileSize/1000); // in KBs
			
			verifyAPIRoute.applyToken(req,res,app,user_id);
			
			// Returns 200 if file details are returned
			res.status(200).json({
				id: 			  id,
				name:  			  name,
				creationDate: 	  creationDate,
				modificationDate: modificationDate,
				fileSize: 		  fileSize,
				mimeType: 		  mimeType
			});
		});
	};
};