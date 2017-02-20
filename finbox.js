var express 	   = require('express');
var path 		   = require('path');
var mysql 		   = require('mysql');
var secureRandom   = require('secure-random');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override')
var helmet         = require('helmet');

var config 		   = require('./scripts/config.js');
var rest 		   = require("./api/REST_API.js");
var verifyAPIRoute = require("./api/verifyAPIRoute.js");
var headerifyAPIRoute = require("./api/headerifyAPIRoute.js");

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
	app.use(bodyParser.urlencoded({ extended: false }));
	app.use(methodOverride('_method'));
	
	app.use(helmet());
	app.set('nJWTsk',secureRandom(512,{type: 'Buffer'}));
	app.set('nJWTalg','HS512');
	
	app.set('port',process.env.PORT || 3000);
	app.use(express.static(path.join(__dirname,'/public')));
	app.use('/bower_components',express.static(path.join(__dirname,'/bower_components')));
	
	app.all('/*',headerifyAPIRoute.headerify); 
	
    var router = express.Router();
	router.use(verifyAPIRoute.verifyToken(app,router,connection));
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