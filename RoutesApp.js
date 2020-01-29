'use strict';

module.exports = function(app) {
  //var kuknosService = require('./serviceController');
  var myfunc = require('./services.js');

	app.get( '/federation',function(req,res){
			try{
			myfunc.federation(req,res);
			}catch(err){
                           console.log(err);
                           res.status(500).send(err);
                      }
		});

}

