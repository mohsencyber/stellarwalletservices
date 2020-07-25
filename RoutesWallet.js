'use strict';

var  Stellar_Sdk=require('stellar-sdk');
var  config  = require('./config.js');
var  channelKey = new Map();

channelKey.set('tecvest','GBTTZLBSY6YETCTYP25P3PQKROODZRYNR5EKVORZHFYLP2JQMHIDOCWB');

module.exports = function(app) {
  //var kuknosService = require('./serviceController');
  var myfunc = require('./services.js');
  
	   app.get('/AccountInfo/:accountId', function(req, res){
		   try{
	        var task = myfunc.accountinfo(req.params.accountId,res);
	        console.log(req.params.accountId);
	        console.log("Router in get_account_info : ",task);
		   }catch(err){
			   console.log(err);
			   res.status(500).send(err);
		   }
	});

	app.get('/assetslist',function(req,res){
		try{
		var assetlist = myfunc.listOfAssets(req,res);
		}catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	});//end func

	  app.post('/PostTrans', (req,res)=>{
		  //console.log(req);
		  try {
			  var xdrreq = req.body.txdr;
			  var requestid = req.body.requestid;
			  if ( requestid ) {
				  myfunc.postRefTransaction(req,res);
			  }else{
		  		var txsubmit = myfunc.postTransaction(xdrreq,res);
			  }
		  //return res.send("Post Ok");
		  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

	  app.post('/submitreq',(req,res)=>{
		  try{
		     var submituser = myfunc.submitUser(req,res);
		   }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  	});

	  app.post('/submitconfirm',(req,res)=>{
		  try{
		  var myres = myfunc.submitConfirm(req,res); 
		  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  	});

	  app.post('/activetoken',(req,res)=>{
		  try{
		  myfunc.activeToken(req,res);
	          }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });
	
	  app.post('/activewallet',(req,res)=>{
		  try{
		  myfunc.activeWallet(req,res);
	  	  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

	  app.post('/transfer',(req,res)=>{
		  try{
		  myfunc.transferTo(req,res);
		  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

	  app.post('/transactioninquiry',(req,res)=>{
		  try{
		  myfunc.TransInquiry(req,res);
		  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

	  app.post('/statement', (req,res)=>{
		  try{
		  myfunc.statement(req,res);
		  }catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
  	  });

	  app.post('/buyassets',(req,res)=>{
		  try{
		var  secureKey= Stellar_Sdk.Keypair.fromPublicKey(config.WalletPubKey);
		var WalletKeyInt = req.body.destinationid+","+req.body.amount+","+req.body.requestid+","+req.body.assetcode;
		  console.log(WalletKeyInt);
	        if ( secureKey.verify(WalletKeyInt,Buffer.from(req.body.securekey ,'base64')) ){
		  myfunc.buyAssets(req,res);
		}else {
			console.log("Request Not Verified.");
			return res.status(401).end(JSON.stringify({message:'ap_not_permitted'}));
		}
		}catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

	  app.post('/manageuser',(req,res)=>{
		try{  
		  var secureKey = Stellar_Sdk.Keypair.fromPublicKey(config.WalletPubKey);
		  if ( req.body.channelname && channelKey.has(req.body.channelname) ){
			  secureKey = Stellar_Sdk.Keypair.fromPublicKey(channelKey.get(req.body.channelname));
		  }
		  var WalletKeyInt = req.body.nationalcode+","+req.body.mobilenumber+","+req.body.accountid;
		  console.log(WalletKeyInt);
		  if ( secureKey.verify(WalletKeyInt,Buffer.from(req.body.securekey,'base64')) ) {
			  myfunc.manageUser(req,res);
		  }else{
			  console.log("Request not verified.");
			  return res.status(401).end(JSON.stringify({message:'ap_not_permitted'}));
		  }
		}catch(err){
			console.log(err);return res.status(500).end(err);
		}



	  });

	  app.post('/chargeaccount',(req,res)=>{
		  try{
			  myfunc.chargeaccount(req,res);
		  }catch(err){
			  console.log(err);
			  res.status(500).send(err);
		  }
	  });

	  app.post('/tokenreport',(req,res)=>{
		  try{
			  myfunc.tokenreport(req,res);
		  }catch(err){
			  console.log(err);
			  res.status(500).send(err);
		  }
	  });

}

