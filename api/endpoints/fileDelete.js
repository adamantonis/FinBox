////////////////////////////////////////////////////////////////////////////////////////////
// Delete a file: This endpoint is used to delete a file which belongs to the logged in user
////////////////////////////////////////////////////////////////////////////////////////////

var mysql 		 		= require('mysql');
var nJwt     	 		= require('njwt');
var encryption   		= require('../../scripts/encryption.js');
var fileHelpers  		= require('./fileHelpers.js');
var validationHelpers  = require('./validationHelpers.js');
var verifyAPIRoute  	= require("../verifyAPIRoute.js");

module.exports.fileDelete=function(app,router,connection,opts) {
	
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
		var checkQuery="SELECT ??,?? FROM ?? as f INNER JOIN ?? as u ON ??=?? WHERE ??=? AND ??=?";
		var checkTable = ["f.user_id_fk",
						  "f.file_id",
						  "user_files",
						  "user",
						  "f.user_id_fk","u.user_id",
						  "u.user_id",user_id,
						  "f.file_id",file_id];
		checkQuery = mysql.format(checkQuery,checkTable);
		connection.query(checkQuery,function(err,checkRows) {

			if(err) 
			{
				// Returns 500 for any other error
				return res.status(500).json({
					success: false,
					message: err
				});
			}

			if (checkRows.length==0)
			{
				// Returns 400 if validation error
				// - File not found
				return res.status(400).json({
					success: false,
					message: 'File not found'
				});
			}

			var deleteQuery="DELETE f "+
							"FROM ?? as f "+
							"INNER JOIN ?? as u ON ??=?? "+
							"WHERE ??=? AND ??=?";
			var deleteTable=["user_files",
							 "user",
							 "f.user_id_fk","u.user_id",
							 "f.file_id",checkRows[0].file_id,
							 "f.user_id_fk",checkRows[0].user_id_fk];
			deleteQuery = mysql.format(deleteQuery,deleteTable);
			connection.query(deleteQuery,function(err,deleteRows) {
				if(err) 
				{
					// Returns 500 for any other error
					return res.status(500).json({
						success: false,
						message: err
					});
				}

				verifyAPIRoute.applyToken(req,res,app,user_id);
				
				// Returns 204 if file was deleted
				return res.status(204).json({
					success: false,
					message: 'File was deleted'
				});
			});
		});
    };
};