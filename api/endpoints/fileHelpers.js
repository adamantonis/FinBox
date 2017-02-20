////////////////////////////////////////
// helper functions for processing files
////////////////////////////////////////

var fs 				= require('fs');
var verifyAPIRoute  = require("../verifyAPIRoute.js");

module.exports.validFileSize=function(file_size) {
	return ((file_size/1000000)<=1.024);
};

var RemoveFile=function(file_path) {
	// remove any temp file(s)
	fs.unlink(file_path,function(err) {
		if (err)
		{
		   // just log the error since the file was uploaded and saved to database
		   console.log(err);
		}
		
	});
};

var RemoveAllFiles=function(fd,files) {
	// remove any temp file(s)
	for (var i=0; i<files.length; i++)
	{
		RemoveFile(files[i].path);
	}
};

module.exports.RemoveFile=RemoveFile;

module.exports.RemoveAllFiles=RemoveAllFiles;

module.exports.closeAndRemoveFile=function(fd,file_path) {
	fs.close(fd, function(err) {
		if (err)
		{
		   // just log the error since the file was uploaded and saved to database
		   console.log(err);
		} 
		else
		{
			// remove temp file
			RemoveFile(file_path);
		}
	});
};

module.exports.closeCurrentAndRemoveAllFiles=function(fd,files) {
	
	fs.close(fd, function(err) {
		if (err)
		{
		   // just log the error since the file was uploaded and saved to database
		   console.log(err);
		} 
		else
		{
			RemoveAllFiles(fd,files);
		}
	});
};

module.exports.checkIfMultiUploadFinished=function(req,res,app,user_id,files,arrAlways,arrStatusCode,arrStatusMessage) {
	
	global.fileSavingCheckTimer=null;
	var fileSavingCheckFunc=function() {
		
		if (arrAlways.length==files.length)
		{
			clearTimeout(global.fileSavingCheckTimer);
			global.fileSavingCheckTimer=null;
			
			var failedIndex=-1;
			for (var j=0; j<arrAlways.length; j++)
			{
				if (arrStatusCode[j]!=201)
				{
					failedIndex=j;
					break;
				}
			}
			
			// Priority is 400 as error so check it first
			if (failedIndex!=-1)
			{
				// Returns xxx for any other error
				return res.status(arrStatusCode[failedIndex]).json({
					success: false,
					message: arrStatusMessage[failedIndex]
				});
			}
			
			verifyAPIRoute.applyToken(req,res,app,user_id);		
			
			// Returns 201 if file saved successfully
			return res.status(201).json({
				success: false,
				message: 'File(s) saved successfully'
			});
		}
		else
		{
			global.fileSavingCheckTimer=setTimeout(function(){ fileSavingCheckFunc(); },100);
		}
	};
	
	fileSavingCheckFunc();
};