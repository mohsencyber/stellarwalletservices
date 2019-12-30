var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  bodyParser = require('body-parser');

//process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
//var  DB_HOST ;
if (process.argv[2]) 
	global.DB_HOST = process.argv[2];
else if ( process.env.DB_HOST )
	global.DB_HOST = process.env.DB_HOST;
else
	global.DB_HOST = "localhost";

if ( process.env.DB_USER )
	global.DB_USER = process.env.DB_USER;
else 
	global.DB_USER ='farhadi';

if ( process.env.DB_PASS )
	global.DB_PASS = process.env.DB_PASS;
else 
	global.DB_PASS ='123456';
;
  console.log(DB_HOST);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  var routes = require('./Routes'); //importing route
  routes(app);
//  app.use(function(req, res) {
//    res.status(404).send({url: req.originalUrl + ' not found '})
//  });

app.listen(port);

console.log('ABPA Keycermony RESTful API server started on: ' + port);
