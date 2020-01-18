var Ddos = require('ddos');
var express = require('express'),
  app = express(),
  port = process.env.PORT || 3000;
  bodyParser = require('body-parser');
//var router=express.Router();

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

if ( process.env.SHAHKAR_USER )
	global.SHAHKAR_USER = process.env.SHAHKAR_USER;
else 
	global.SHAHKAR_USER = "tech@kuknos.org";

if ( process.env.SHAHKAR_PASS )
	global.SHAHKAR_PASS = process.env.SHAHKAR_PASS;
else 
	global.SHAHKAR_PASS = "Ci699!";


  var ddos = new Ddos({burst:10, limit:15})
  var wallet =  express();
  var anchor =  express();
  console.log(DB_HOST);
  app.use(ddos.express);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use('/wallet',wallet);
  app.use('/anchor',anchor);

  var routes = require('./Routes'); //importing route
  routes(wallet);
  routes(anchor);
  routes(app);
  //router.use(function(req,res,routes){
  //	  routes(router);
  //});
  //app.use('/wallet',routes(app));
  //routes(app);
//  app.use(function(req, res) {
//    res.status(404).send({url: req.originalUrl + ' not found '})
//  });

app.listen(port);

console.log('ABPA Keycermony RESTful API server started on: ' + port);
