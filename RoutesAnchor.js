'use strict';

module.exports = function(app) {
  //var kuknosService = require('./serviceController');
  var myfunc = require('./services.js');

  		app.post('/buyassetsthirdparty',(req,res)=>{
			try{
			  myfunc.buyAssetsThird(req,res);
			}catch(err){
                           console.log(err);
                           res.status(500).send(err);
                      }
		  });
}

