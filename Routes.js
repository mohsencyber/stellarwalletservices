'use strict';
module.exports = function(app) {
  //var kuknosService = require('./serviceController');
  var myfunc = require('./services');

  app.get('/wallet/AccountInfo/:accountId', function(req, res){
        var task = myfunc.accountinfo(req.params.accountId,res);
        console.log(req.params.accountId);
        console.log("Router in get_account_info : ",task);
});

	app.get( '/federation',function(req,res){
		myfunc.federation(req,res);
	});
	app.get('/wallet/assetslist',function(req,res){
		var assetlist = myfunc.listOfAssets(req,res);
	});//end func

  app.post('/wallet/PostTrans', (req,res)=>{
	  //console.log(req);
	  var txsubmit = myfunc.postTransaction(req.body.txdr,res);
	  //return res.send("Post Ok");
  });

  app.post('/wallet/submitreq',(req,res)=>{
	  var submituser = myfunc.submitUser(req,res);
  	});

  app.post('/wallet/submitconfirm',(req,res)=>{
	  var myres = myfunc.submitConfirm(req,res); 
  	});


  app.post('/wallet/activetoken',(req,res)=>{
	  myfunc.activeToken(req,res);
  });

  app.post('/wallet/transfer',(req,res)=>{
	  myfunc.transferTo(req,res);
  });
}

