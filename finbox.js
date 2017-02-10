var express 	   = require('express');
var path 		   = require('path');
var mysql 		   = require('mysql');
var nJwt    	   = require('njwt');
var secureRandom   = require('secure-random');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override')

var config 		   = require('./scripts/config.js');
var encryption     = require('./scripts/encryption.js');
var rest 		   = require("./api/REST_API.js");

var app = express();

function INIT_REST_API() 
{
    var self = this;
    self.connectMysql();
};

INIT_REST_API.prototype.connectMysql = function(){
	
    var self = this;
	
    var pool      =    mysql.createPool({
        host: 		     config.db_host,
        user:            config.db_user,
        password:        config.db_password,
        database:        config.db_database,
		connectionLimit: config.db_connectionLimit
    });
	
    pool.getConnection(function(err,connection){
        if (err) 
		{
           self.stop(err);
        } 
		else 
		{
           self.configureExpress(connection);
        }
    });
}

INIT_REST_API.prototype.configureExpress = function(connection) {
	
    var self = this;
	
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(methodOverride('_method'));
	
	app.set('nJWTsk',secureRandom(256,{type: 'Buffer'}));
	app.set('nJWTalg','HS512');
	app.set('port',process.env.PORT || 3000);
	app.use(express.static(path.join(__dirname,'/public')));
	app.use('/bower_components',express.static(path.join(__dirname,'/bower_components')));
	
    var router = express.Router();
	
	router.use(function(req, res, next) {
		
		// Other than the register and auth endpoints all other endpoints can only be accessed by authenticated users
		if ((req.url === '/auth') || (req.url === '/users') || (req.url === '/favicon.ico')) // and the annoying favicon
		{
			return next();
		}
		
		// verify token before getting into any root
		var token = ((req.body.token) || (req.query.token) || (req.headers['x-access-token']));
		if ((token) && (typeof token !== 'undefined')) 
		{
			token=encryption.decryptPassword(token);
			nJwt.verify(token,app.get('nJWTsk'),app.get('nJWTalg'),function(err,verifiedJwt){     
				if (err) 
				{
					//console.log("Token could not be verified at: "+Date.now());
					
					// remove the header for security
					res.removeHeader('x-access-token');
					
					// Returns 403 if could not verify token
					res.status(403).send("Could not verify token");				
				} 
				else 
				{
					
					//console.log("Token verified at: "+Date.now());
					
					// the token has been verified, so save the verifiedJwt to the request for use in other routes
					req.verifiedJwt = verifiedJwt;    
					next();
				}
			});
		} 
		else // this will be the answer to all paths for now
		{
			// Returns 403 if user not authenticated
			res.status(403).send("User not authenticated");	
		}
	});
	
    app.use(router);
	  
    var rest_router = new rest(app,router,connection);
	  
    self.startServer();
}

INIT_REST_API.prototype.startServer = function() {
	app.listen(app.get('port'),function(){
		console.log('FinBox started at port ' + app.get('port'));
	});
}

INIT_REST_API.prototype.stop = function(err) {
    console.log("There was an error in MySQL: " + err);
    process.exit(1);
}

new INIT_REST_API();