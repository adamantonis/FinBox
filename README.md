# FinBox

Simple file management web application

Built With
----------
Nodejs, Express, MySQL, Bootstrap, jQuery

Features
--------
* Register an account
* Upload one or multiple files
* List own files
* Update one or multiple own files
* Delete own files
* Download own files

Installation Steps
------------------
Step 1. Download, install and configure MySQL Server as per https://www.mysql.com

Step 2. Open MySQL CLI or any available MySQL interface

Step 3. Create a database user to be used to connect to finbox database as per the required db_ connection settings located in the config file finbox/scripts/config.js

Step 4. Paste the contents of the finbox/database.sql to the MySQL CLI/interface to create the required database tables

Step 5. Download, install and configure Nodejs Engine as per https://nodejs.org

Step 6. Download, and copy FinBox app to the specified Nodejs installation path, specifically to the bin directory  ... /nodejs/bin

Step 7. Open Nodejs CLI or any available Nodejs interface and cd yourself to the bin directory where you have just copied the finbox app ie. cd to ... /nodejs/bin/finbox

Step 8. Type 'npm install' to install all the server side packages required for the app to run - see finbox/package.json

Step 9. Type 'bower install' to install all the front end packages required for the app to run - see finbox/bower.json

Step 10. Type 'npm start' to start FinBox app and you are good to go!

Step 11. Go to your browser and open the link eg. http://localhost:3000/, where 3000 is the port that the server is currently listening to, see finbox/finbox.js to adjust the port accordingly

Any questions? Please let me know!
