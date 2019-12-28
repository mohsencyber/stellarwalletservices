const StellarSdk =  require('stellar-sdk');
const StellarBase = require('stellar-base');
const uuid =     require('uuid');
const SqlQ =     require('./db.js');
const conf =     require('./config.js');
const https =    require('https');
const myXdr =    require('js-xdr');
const KuknosID = require('./KuknosID.js');
const util =     require('util');
const Assets =   require('./Assets.js');

//accID tecvest = 'GD2YOX2GL3LQQKLNBKRG3H2MXRLCL6OM24PRXATIWC2RHD4Q6EE44BUL';
const publicKey='GDKHHHLBBCAEUD54ZBGXNFSXBR37EUHJCKGXOFTJLXXLIA75TNK533SI';
const secretKey='SCOE3UNFCGYGKHWLLEG2KONSE7OYXHTWTTEGCQ6B2VYP5HH76S6PYOGI';
const  server = new StellarSdk.Server(conf.HorizonUrl);//'https://hz1-test.kuknos.org');

async function getAccountInfo(accid){
	var resultJson;
	console.log("account Info : ended " );
	return resultJson;
};

exports.accountinfo = async function(req,res){
//results = 
	var result;
	var kuknosID= new KuknosID(req);
        //const getAccountID = util.promisify(kuknosID.getAccountID);
	kuknosID.getAccountID(SqlQ,async function(ireq){

	var sqluser="select id,concat(username,'*',domain) username ,domain,mobilenumber,email,nationalcode,fullname from users where id=?";
	var value=[ireq];
	//var userinfoObj= new Object();
	var userInfoJson="{}";
	var accInfoJson="{}";
		if ( !ireq)
			return res.json(userInfoJson);
	//console.log("<"+req.length+">","===");
	//console.log("<"+ireq.length+">");
	 await server.accounts()
	.accountId(ireq)//StellarSdk.Keypair.fromPublicKey(publicKey))
		.call()
		.then(function(results) {
			console.log("accountInfo : ",results.sequence)
			console.log("accountBalance : ",results.balances)
			console.log("in getaccount Info : ended ");
			//console.log(results);
			accInfoJson = results;//JSON.parse(JSON.stringify(results));
			//console.log(accInfoJson);
		}).catch(err => {
			console.log("====>",err);
			//return res.json(accInfoJson);
		});

	SqlQ.query(sqluser,value,function(err,result){
		if ( err ) console.log(err);
		if ( result.length ){
			userInfoJson = result[0];//JSON.parse(JSON.stringify(result[0]));
			console.log("userInfoJson:");//,userInfoJson);
			var alldata={...userInfoJson,...accInfoJson};
			//console.log(alldata);
			return res.json(alldata);
		}else{
			console.log("AccInfo:");
			//console.log(accInfoJson);
			return res.json(accInfoJson);
		}
	});//end query
	});
	};//end function


exports.postTransaction = function(req,res){
//results =
        var result;
	//console.log(req);
	const transaction = new StellarBase.Transaction(req,conf.NetworkPass);
	//const transaction1 = new StellarSdk.xdr.Transaction(req,'Kuknos-NET');
	//const transaction = new StellarSdk.TransactionBuilder(transaction1);
        var srcTrns = StellarBase.StrKey.encodeEd25519PublicKey(transaction.toEnvelope().tx().sourceAccount().ed25519());
        //var output = transaction.toXDR();
	//var trns = myXdr.Envelope.fromXDR(req);
	if ( conf.SourceControl ){
		var sqlstr = "select * from validsource where accountid=?";
		var values = [srcTrns];
		SqlQ.query(sqlstr,values,function(err,result){
			if (err) return res.end(err);
			if (!result.length ) 
				return res.status(400).end("Transaction not permitted");
		});
	}
        server.submitTransaction(transaction).then (results => {
		return res.send(JSON.stringify(results));
	}).catch(err =>{ 
		console.log(err.response.data.extras.result_codes);
		return  res.status(400).send(err.response.data.extras.result_codes);
	} );
};



exports.submitUser = function(req,res){
	var result;
	//DbCon.connect(function(err){
	//	if (err) return res.send(err);
		console.log('db Connected.');
		var ticket = uuid.v4();
		var sms = Math.floor(Math.random() * (9988 - 1111)) + 1111;//234';
	        var urlhref= "https://sms.magfa.com/magfaHttpService?service=enqueue&username=<username>&password=<.>&from=30009629&to="+req.body.mobilenumber+"&message="+conf.Message+sms;
	        https.get(urlhref,ress=> {
			console.log(ress.body);
		});
		var sqlstrins = "insert into sessions (accountid,ticket , sms ,timereq,mobilenumber,nationalcode,fullname) values (?,?,?,now(),?,?,?)";
		var sqlstrupd = "update sessions set accountid=?, ticket=? , sms=? , timereq=now() , mobilenumber=? , fullname=? where nationalcode=?";
		var sqlstrexi = "select * from sessions where nationalcode=? ";
		var valuesins = [ req.body.accountid,ticket,sms,req.body.mobilenumber,req.body.nationalcode,req.body.fullname ];
		var valuesupd = [ req.body.accountid,ticket,sms,req.body.mobilenumber,req.body.fullname,req.body.nationalcode ];
		var valuesexi = [ req.body.nationalcode ];
	        SqlQ.getConnection(function(err,SqlQC){
		SqlQC.query(sqlstrexi,valuesexi,function(err,result){
			console.log("sqlstr exists.");
			if (err) return  res.send(err);
			if ( result.length ) {
			   	SqlQC.query(sqlstrupd,valuesupd,function(err,result){
					console.log("sqlstr update.");
					if (err) return  res.send(err);
					SqlQC.commit(function(err) {
        				   if (err) {
          				     SqlQC.rollback(function() {
            				     //throw err;
          				     });
					   return res.end(err);
        				 }});
					//SqlQ.end();
					return res.end(ticket);
				});
			}else {
				SqlQC.query(sqlstrins,valuesins,function(err,result){
					console.log("sqlstr insert.");
					if (err) return res.end(err);
					SqlQC.commit(function(err) {
        				  if (err) {
          				    SqlQC.rollback(function() {
            				    //throw err;
          				    });
					  return res.end(err);
        				 }});
					//SqlQ.end();
					return res.end(ticket);
				});

			}
		});
			
	});
	//DbCon.commit();
};

exports.submitConfirm = function(req,res){
		var ticket=req.body.ticket;
		var sms = req.body.sms;
		var sqlstr= "select * from sessions a where now() < timereq+"+conf.TimeOut+" and ticket=? and sms=? ";
	        var sqlconfiguser= "insert into users values(?,?,?,?,?,?,?)";
		var values = [ ticket,sms];
	        var asyncres = "";
		SqlQ.query(sqlstr,values,function(err,result){
			if (err){ 
				console.log("ticket is err.",err);
				//SqlQ.end();
				return  res.status(400),send("error");
			       }
			if (result.length ) {
			   var rows = result[0];
    			   console.log(rows);
			   //SqlQ.end();
	                  var source = StellarSdk.Keypair.fromSecret(secretKey);
			  var destination= StellarSdk.Keypair.fromPublicKey(rows.accountid);
			  try{
			   server.accounts()
			  .accountId(source.publicKey())
			  .call()
			  .then(({ sequence }) => {
			    const account = new StellarSdk.Account(source.publicKey(), sequence)
			    const transaction = new StellarSdk.TransactionBuilder(account, {
			      fee: conf.BaseFee,//StellarSdk.BASE_FEE,
			      networkPassphrase: conf.NetworkPass//'Kuknos-NET'
			    })
			      .addOperation(StellarSdk.Operation.createAccount({
			        destination: destination.publicKey(),
			        startingBalance: conf.CreateAmnt//'3'
			      }))
			          .setTimeout(0)
			      .build();
    			transaction.sign(StellarSdk.Keypair.fromSecret(source.secret()));
			server.submitTransaction(transaction).then(subresult=>{
				          var valueins=[rows.accountid,rows.nationalcode,conf.HomeDomain,rows.mobilenumber,"",rows.nationalcode,rows.fullname];
				          SqlQ.query(sqlconfiguser,valueins,function(err,resultt){
						  console.log(err);
					  });
					  return res.send(rows.accountid);
				  }).catch(function(error){
					  console.log("submitError==>"+error);
					  return res.status(400).send(error.response.data.extras.result_codes);
				  });
          		});
			}catch(errors){
				console.log("errors2:"+errors);
				return res.status(404).end(errors);
			      };
			} else {
				console.log("ticket is invalid.");
				//SqlQ.end();
				//console.log("ticket is invalid2.");
				return res.status(404).send("{message:'ticket invalid'}");
			}
		});
	//});
 };

exports.activeToken = function (req,res){
	var asset = new Assets(req.body.assetcode,req.body.assetissuer);
	//var token = new StellarSdk.Asset('ABPA', issuingKeys.publicKey());
	var token  = asset.getAssetObj();
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 

  server.loadAccount(requested.publicKey())
    .then(function(receiver) {
      var transaction = new StellarSdk.TransactionBuilder(receiver, {
        fee: conf.BaseFee,
        networkPassphrase: conf.NetworkPass//'Kuknos-NET'
      })
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: token 
          //,limit: '1000000'
        }))
        .setTimeout(0)
        .build();
         return  res.end(transaction.toXDR());
    });

};//end func

exports.listOfAssets = function(req,res){
	var sqlstr = "select * from assets ";
	SqlQ.query(sqlstr,null,function(err,result){
		if ( err ) return res.end("{}");
		//console.log(result);
		return res.json(result);
	});
};//end func

exports.transferTo = async function(req,res){
	var accountID = req.body.accountid;
	var destinationID =  new KuknosID(req.body.destinationid);
	var amount = req.body.amount;
	var asset = new Assets(req.body.assetcode,req.body.assetissuer);
	console.log(req.body.assetcode);
	destinationID.getAccountID(SqlQ,async  function(destinationID){
		if ( !destinationID )
			return res.status(404).end("destination Accound not found");
		const accountSrc = await server.loadAccount(accountID);
		const transaction = new StellarSdk.TransactionBuilder(accountSrc, {
			fee:conf.BaseFee,
			networkPassphrase: conf.NetworkPass
		}).addOperation(StellarSdk.Operation.payment({
      			destination: destinationID,
			asset:asset.getAssetObj(),
			amount:amount,
		})).setTimeout(0)
		.build();
		return res.end(transaction.toXDR('base64'));
	});

};//end func
