var fs 			 = require('fs');
var path 		 = require('path');
var mysql 		 = require('mysql');
var nJwt     	 = require('njwt');
var secureRandom = require('secure-random');
var multer  	 = require('multer');
var encryption   = require('../scripts/encryption.js');
var reqBody		 = multer();

var userLoginEndpoint      = require('./endpoints/userLogin.js');
var userRegisterEndpoint   = require('./endpoints/userRegister.js');
var userLogoutEndpoint     = require('./endpoints/userLogout.js');
var userDetailsEndpoint    = require('./endpoints/userDetails.js');

var fileListEndpoint       = require('./endpoints/fileList.js');
var fileUploadEndpoint     = require('./endpoints/fileUpload.js');
var fileUpdateEndpoint 	   = require('./endpoints/fileUpdate.js');
var fileDeleteEndpoint     = require('./endpoints/fileDelete.js');
var fileDetailsEndpoint    = require('./endpoints/fileDetails.js');
var fileDownloadEndpoint   = require('./endpoints/fileDownload.js');

function REST_API(app,router,connection) 
{
    var self = this;
    self.handleRoutes(app,router,connection);
}

REST_API.prototype.handleRoutes= function(app,router,connection) {
	/***********************************************************************************/
	// Ignore favicon requests for now
	/***********************************************************************************/
	router.get('/favicon.ico', function(req, res) {
		res.status(204).send("Bypassed favicon request");
	});
	/***********************************************************************************/
	// Send index page
	/***********************************************************************************/
    router.get("/",function(req,res){
        res.sendFile(path.join(__dirname,'/index.html'));
    });
	/***********************************************************************************/
	// Register a user: This endpoint is used to register a new user
    router.post("/users",userRegisterEndpoint.userRegister(app,router,connection));
	/***********************************************************************************/
	// Login a user: This endpoint is used to authenticate a registered user
	router.post("/auth",userLoginEndpoint.userLogin(app,router,connection));
	/***********************************************************************************/
	// Logout: This endpoint is used to log out a logged on authenticated user
	router.post("/logout",userLogoutEndpoint.userLogout(app,router,connection));	
	/***********************************************************************************/
	// Get logged on user details
    router.get("/me",userDetailsEndpoint.userDetails(app,router,connection));
	/***********************************************************************************/
	// Get file lists
    router.get("/files",fileListEndpoint.fileList(app,router,connection));
	/***********************************************************************************/
	// Upload a file: This endpoint is used to upload new files and save them in the database
	router.put("/files",fileUploadEndpoint.fileUpload(app,router,connection));
	/***********************************************************************************/
	// Update a file: This endpoint is used to update the contents of an existing file
	router.patch("/files/:fileid",fileUpdateEndpoint.fileUpdate(app,router,connection));
	/***********************************************************************************/
	// Delete a file: This endpoint is used to delete a file which belongs to the logged in user
	router.delete("/files/:fileid",fileDeleteEndpoint.fileDelete(app,router,connection));
	/***********************************************************************************/
	// Get file details: This endpoint is used to get the details of a file
    router.get("/files/:fileid",fileDetailsEndpoint.fileDetails(app,router,connection));
	/***********************************************************************************/
	// Download a file: This endpoint is used to download the contents of a file
    router.get("/files/:fileid/contents",fileDownloadEndpoint.fileDownload(app,router,connection));
	/***********************************************************************************/
}

module.exports = REST_API;