/////////////////////////////////////////////////////////////////////////////////////
// Get file lists
/////////////////////////////////////////////////////////////////////////////////////

var mysql  				= require('mysql');
var moment 				= require('moment');
var encryption   		= require('../../scripts/encryption.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

module.exports.fileList=function(app,router,connection,opts) {
	
    opts=opts || (opts = {});
  
    return function(req,res,next) {
		
		var result=validationHelpers.validUserAction(req);
		if (!result.valid)
		{
			return res.status(result.statusCode).json({
				success: result.valid,
				message: result.message
			});
		}

		var user_id=encryption.decryptStr(req.verifiedJwt.body.sub);
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
					 "u.user_id",
					 user_id];
		query = mysql.format(query,table);
		connection.query(query,function(err,rows) {
			if(err) 
			{
				console.log(err);
				
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}
			
			verifyAPIRoute.applyToken(req,res,app,user_id);
			
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
					id: 			  id,
					name:  		      name,
					creationDate: 	  creationDate,
					modificationDate: modificationDate,
					fileSize: 		  fileSize,
					mimeType: 		  mimeType
				});
			}
			
			// Returns 200 if list is retrieved
			return res.status(200).json(file_list);
		});
	};
};