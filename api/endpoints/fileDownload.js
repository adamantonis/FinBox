/////////////////////////////////////////////////////////////////////////////////////////
// Upload a file: This endpoint is used to upload new files and save them in the database
/////////////////////////////////////////////////////////////////////////////////////////
var events 	   			= require('events');
var mysql 	   			= require('mysql');
var fs    	   			= require("fs");
var encryption 			= require('../../scripts/encryption.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

module.exports.fileDownload=function(app,router,connection,opts){
	
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
			var file_buffer = new Buffer(rows[0].file);
			var fileSize=rows[0].file_size;
			var mimeType=rows[0].mime_type;
			
			var now=Date.now();
			var download_path = __dirname +'/download/'+name; // +"-"+now;
			var download_name = name;
			
			// create the file
			fs.writeFile(download_path, file_buffer, function(err) {
				if (err) 
				{
					return res.status(500).json({
						success: false,
						message: err
					});
				}
				
				verifyAPIRoute.applyToken(req,res,app,user_id);

				// Returns 200 if file has been generated
				res.statusCode=200;
				res.statusMessage="File has been generated"
				
				// download the file
				res.download(download_path,download_name, function(err) {
					
					// remove file after download
					fs.unlink(download_path,function(err){
						if (err)
						{
						   // just log the error since the file was downloaded
						   console.log(err);
						} 
					});
					
					if (err) 
					{
						return res.status(500).json({
							success: false,
							message: err
						});
					} 
				});
			});
		});
	};
};