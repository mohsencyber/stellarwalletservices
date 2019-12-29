'use strict';
module.exports = function(app) {
  //var kuknosService = require('./serviceController');
  var myfunc = require('./services');

  app.get('/AccountInfo/:accountId', function(req, res){
        var task = myfunc.accountinfo(req.params.accountId,res);
        console.log(req.params.accountId);
        console.log("Router in get_account_info : ",task);
});

	app.get( '/federation',function(req,res){
		myfunc.federation(req,res);
	});
	app.get('/assetslist',function(req,res){
		var assetlist = myfunc.listOfAssets(req,res);
	});//end func

  app.post('/PostTrans', (req,res)=>{
	  //console.log(req);
	  var txsubmit = myfunc.postTransaction(req.body.txdr,res);
	  //return res.send("Post Ok");
  });

  app.post('/submitreq',(req,res)=>{
	  var submituser = myfunc.submitUser(req,res);
  	});

  app.post('/submitconfirm',(req,res)=>{
	  var myres = myfunc.submitConfirm(req,res); 
  	});


  app.post('/activetoken',(req,res)=>{
	  myfunc.activeToken(req,res);
  });

  app.post('/transfer',(req,res)=>{
	  myfunc.transferTo(req,res);
  });
}

