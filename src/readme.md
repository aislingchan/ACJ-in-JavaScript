# Readme

This is a web application written in JavaScript using the Express.js framework.

* The `files-for-testing` folder contains files with dummy source code in many different languages. These files are only used for testing features of the web app. There are also two CSV files included which each contain fake email addresses. These are intended to be used by testers of the web app when testing the "create activity" page.
* The `server` folder contains all of the code required to run the web application.
* The `server/routes` folder contains `auth.js`, which defines the routes for the log in system, and "index.js", which defines the routes for the rest of the web pages.
* The `server/view` folder contains handlebars templates which are used to generate the HTML for all of the web pages.
* The `server/.env` and `server/authConfig.js` files contain data used in the OpenID Connect flow which allows users to log in using their Microsoft email account.
* The `server/acj.db` file is an SQLite database which stores all of the data for the web app.
* The `server/acj.js` file contains the code used to manage rounds of ACJ.
* The `server/database.js` file contains functions for storing and editing data in the SQLite database.
* The `server/main.js` file contains the code setting up the database for testing.
* The `server/server.js` file contains the code for setting up the web server.
* The `server/package-lock.json` and `server/package.json` files contain metadata about the project.
* The `server/rankingLogger.js` and `server/resultsLogger.js` files were used to log data about the process of ACJ for testing during development. These are not integral to the web applicaton.

## Build instructions

### Requirements

* Node 18.8.0
* npm 8.18.0
* Packages: listed in `package.json` and `package-lock.json`
* Tested on macOS Ventura version 13.2.1

### Build steps

* The log in system uses Microsoft OpenID Connect. For this to function properly, the web application needs to be registered with the Microsoft identity platform.
* Guidance on how to register a web app with the Microsoft identity platform can be found here https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app and here https://learn.microsoft.com/en-us/azure/active-directory/develop/tutorial-v2-nodejs-webapp-msal.


* Navigate to the `server` folder and run the command `npm install` to install all of the project's dependencies.

### Test steps

To run the web application:

* Navigate to the `server` folder.
* Run `node main.js <your-microsoft-email>`. This will set up the database tables and create an activity with dummy data. By giving an email address as an argument, you will be given access to the pre-made activity when you log in using that email. Note: The email is case-sensitive.

* Run `npm start` to start the web sever.
* Navigate to `http://localhost:8000/` using a web browser (Firefox, Google Chrome, Safari)

