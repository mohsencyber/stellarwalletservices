'use strict';

var  Stellar_Sdk=require('stellar-sdk');
var  config  = require('./config.js');

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
		  var txsubmit = myfunc.postTransaction(req.body.txdr,res);
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

	  app.post('/buyassets',(req,res)=>{
		  try{
		var  secureKey= Stellar_Sdk.Keypair.fromPublicKey(config.WalletPubKey);
		var WalletKeyInt = req.body.destinationid+","+req.body.amount+","+req.body.requestid+","+req.body.assetcode;
		  console.log(WalletKeyInt);
	        if ( secureKey.verify(WalletKeyInt,Buffer.from(req.body.securekey ,'base64')) ){
		  myfunc.buyAssets(req,res);
		}else {
			console.log("Request Not Verified.");
			return res.status(401).end("{message:'not_permitted'}");
		}
		}catch(err){
                           console.log(err);
                           res.status(500).send(err);
                   }
	  });

}

