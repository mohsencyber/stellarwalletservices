const StellarSdk =  require('stellar-sdk');
const StellarBase = require('stellar-base');
const uuid =     require('uuid');
const PgSql =    require('./pgdb.js');
const SqlQ =     require('./db.js');
const SqlQSync =     require('./dbsync.js');
const conf =     require('./config.js');
const https =    require('https');
const myXdr =    require('js-xdr');
const KuknosID = require('./KuknosID.js');
const util =     require('util');
const Assets =   require('./Assets.js');
const NationalChecker = require('./nationalcodechecker.js');
const TransferAuthorize = require('./transferauthorize.js');
const SmsSender = require('./smssender.js');
const BigNumber = require('bignumber.js');

global.SHAHKAR_URL=conf.ShahkarUrl;

StellarSdk.Config.setAllowHttp(conf.AllowHttp);

//const PMNPublicSrc='GD2YOX2GL3LQQKLNBKRG3H2MXRLCL6OM24PRXATIWC2RHD4Q6EE44BUL';//live
//const TokenPublicSrc='GBRWNYWOOFSNOQTPURSTNOYCKFT37C6D62POLSDR43MHZOQASKERSZY2';//live
const PMNPublicSrc='GDKHHHLBBCAEUD54ZBGXNFSXBR37EUHJCKGXOFTJLXXLIA75TNK533SI';//test
const TokenPublicSrc='GCGCUPOOBBWC4PX6RFQC7IAE5EQSTCWACHD3KUKIVV7BCR65PDABRI4J';//test

//accID tecvest = 'GD2YOX2GL3LQQKLNBKRG3H2MXRLCL6OM24PRXATIWC2RHD4Q6EE44BUL';
//const publicKey='GBQ7LPNULIXKQHZNFUUA7QURKZG4QHYE5LI6QPDKRWTT37BDTSW6DBVC';//live
//const secretKey='SCOEJGH5I23FLXYMD3ZVNUMUVHMBD5T3UZB36PAWSLXIB5LYDI7X3BVC';//live
const publicKey='GDKHHHLBBCAEUD54ZBGXNFSXBR37EUHJCKGXOFTJLXXLIA75TNK533SI';//test
const secretKey='SCOE3UNFCGYGKHWLLEG2KONSE7OYXHTWTTEGCQ6B2VYP5HH76S6PYOGI';//test
const  server = new StellarSdk.Server(conf.HorizonUrl);//'https://hz1-test.kuknos.org');
const server_statement = new StellarSdk.Server('https://horizon.kuknos.org');
const notified_sms = new Map();
notified_sms.set('PMN',false).set('ABPARS',false).set('A101',false);

async function getAccountInfo(accid){
	var resultJson;
	console.log("account Info : ended " );
	return resultJson;
};

function sendCrtSms (message,curr){
        console.log("--------------------------------------");
        console.log(`Accounts is not enough for ${curr}, please charge tecvest-Wallet account.`);
        console.log("--------------------------------------");
        var smsSender=new SmsSender(conf.SmsUser,conf.SmsPass,conf.SmsPatternId,conf.SmsNumber,conf.SmsUrl);
        console.log(`sms is needed`);
	if ( notified_sms.get(curr) ){ 
        	smsSender.sendSms(`Accounts is not enough balance for ${curr}, please charge tecvest-Wallet account.`,"09123160191",function(res){
                 	console.log(res);
        	});
		notified_sms.set(curr, false);
	}
};

exports.accountinfo = async function(req,res){
//results = 
	var result;
	var kuknosID= new KuknosID(req);
	kuknosID.getAccountID(SqlQ,async function(ireq,userinfo){

	var sqluser="select id,concat(username,'*',domain) username ,domain,mobilenumber,email,nationalcode,fullname,personality,corpid from users where id=?";
	var value=[ireq];
	var userInfoJson="{}";
	var accInfoJson="{}";
		if ( !ireq)
			return res.json(userInfoJson);
	 await server.accounts()
	.accountId(ireq)//StellarSdk.Keypair.fromPublicKey(publicKey))
		.call()
		.then(async function(results) {
			console.log("accountInfo : ",results.sequence)
			console.log("accountBalance : ",results.balances)
			console.log("in getaccount Info : ended ");
			//console.log(results);
			accInfoJson = results;//JSON.parse(JSON.stringify(results));
			//console.log(accInfoJson);
	if ( !userinfo ){ //userid in accountid

	await SqlQ.query(sqluser,value,async function(err,result){
		if ( err ) console.log(err);
		if ( result.length ){
			userInfoJson = result[0];//JSON.parse(JSON.stringify(result[0]));
			console.log("userInfoJson:");//,userInfoJson);
			var alldata;
			if ( accInfoJson.id)
			   alldata={...userInfoJson,...accInfoJson};
			else
			   alldata=userInfoJson;
			//console.log(alldata);
			return res.status(200).json(alldata);
		}else{
			console.log("AccInfo:");
			var sqlhistory = "select * from users_history where id = ? ";
			var valuehistory = [ireq];
			var isArchive={archive:"yes"};
			var alldata2;
			await SqlQ.query(sqlhistory,valuehistory,(err,his_res)=>{
				if (his_res.length){
					alldata2={...isArchive,...accInfoJson};
					return res.json(alldata2);
				}else{
					return res.json(accInfoJson);
				}
			});	
			//console.log(accInfoJson);
		}
	});//end query
	}else{
		//set userid in kuknosid
		console.log("userinfo::");
		var alldata;
		if ( accInfoJson.id )
		    alldata={...userinfo,...accInfoJson};
		else 
		    alldata=userinfo;
		return res.status(200).json(alldata);
	}
		}).catch(err => {
			console.log("====>",err);
			return res.status(404).end(JSON.stringify({message:'ap_account_not_found'}));
			//return res.json(accInfoJson);
		});
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
	var operations = transaction.operations;//transaction.toEnvelope().tx().operations();
	var transferAuth = new TransferAuthorize(SqlQSync,StellarSdk,conf,server);
	transferAuth.isOperationPermitted(srcTrns,operations, (result)=>{
		console.log(`[PostTrans]isOperationPermitted result is ${result}:`);
		if ( result ){
			console.log("isPermitted")
        		server.submitTransaction(transaction).then (results => {
				return res.send(JSON.stringify(results));
			}).catch(err =>{ 
				console.log(err.response.data.extras.result_codes);
				return  res.status(406).send(err.response.data.extras.result_codes);
			} );
		}
		else 
			return res.status(401).send(JSON.stringify({message:'ap_transfer_not_permitted'}));
	}).catch( err=>{
		console.log(err);
	});
};

exports.postRefTransaction = function(req,res){
//results =
        var result;
	var xdrreq = req.body.txdr

	var id = req.body.requestid;
        var sqlStr = " select * from buyrequest where requestid=? and destinationid is null";
        var insSqlStr="insert into buyrequest (requestid,destinationid) values(?,null)";
        var Values=[id];
        var updateStr="update buyrequest set status='success' where requestid=? and destinationid is null";
        var updateErrStr="update buyrequest set status='fail' where requestid=? and destinationid is null";
        SqlQ.query(sqlStr,Values,async (err,resultid)=>{
        if ( resultid.length || err ){
                return res.status(401).send(JSON.stringify({message:'ap_transaction_duplicate'}));
        }else{
            try{
                SqlQ.query(insSqlStr,Values, async (error,results)=>{
                        if (error )
                                return  res.status(401).end("Internal server Error.");
        	//console.log(req);
	        const transaction = new StellarBase.Transaction(xdrreq,conf.NetworkPass);
	        var srcTrns = StellarBase.StrKey.encodeEd25519PublicKey(transaction.toEnvelope().tx().sourceAccount().ed25519());
	        var operations = transaction.operations;//transaction.toEnvelope().tx().operations();
	        var transferAuth = new TransferAuthorize(SqlQSync,StellarSdk,conf,server);
	        transferAuth.isOperationPermitted(srcTrns,operations, (result)=>{
                console.log(`[PostTrans]isOperationPermitted result is ${result}:`);
                  if ( result ){
                          console.log("isPermitted")
                          server.submitTransaction(transaction).then (subres => {
                                          SqlQ.query(updateStr,Values,async (error,results)=>{
                                                  if (error ){
                                                          console.log(`[ERROR]${error}`);
                                                          return  res.status(401).end("Internal server error");
                                                    }else
                                                       //return res.send(subres.ledger.toString());
                                  	  	       return res.send(JSON.stringify(subres));
                                          })
                         }).catch(err =>{
                                  console.log(err.response.data.extras.result_codes);
                                  SqlQ.query(updateErrStr,Values,(errm,ress)=>{
                                          console.log(errm);
                                  });
                                  return  res.status(406).send(err.response.data.extras.result_codes);
                          } );
                  }
                  else{
                          SqlQ.query(updateErrStr,Values,(errm,ress)=>{
                                  console.log(errm);
                          });
                          return res.status(401).send(JSON.stringify({message:'ap_transfer_not_permitted'}));
	  	  }
                }).catch( err=>{
                        SqlQ.query(updateErrStr,Values,(errm,ress)=>{
                                console.log(errm);
                        });
                        console.log(err);
       	              });
	        });
             }catch(error){
                   SqlQ.query(updateErrStr,Values,(err,ress)=>{
                                console.log(error);
                                return res.status(401).end(error);
                        });
             }
	   }//else
	});
};


exports.submitUser = function(req,res){
	var result;
	//DbCon.connect(function(err){
	//	if (err) return res.send(err);
		console.log('db Connected.');
	        var sqlCheck="select * from users where nationalcode=? and personality=? ";
	        var nationalChecker = new NationalChecker(req.body.personality,req.body.nationalcode,req.body.corpid,req.body.mobilenumber);
	        var valCheck=[req.body.nationalcode,nationalChecker.personality];
	        SqlQ.query(sqlCheck,valCheck,(err,resultin)=>{
		  if ( !resultin.length ) {
	nationalChecker.isVerified( resv=>{
		if ( resv ) {
		var ticket = uuid.v4();
		var sms = Math.floor(Math.random() * (9988 - 1111)) + 1111;//234';
	        var smsSender=new SmsSender(conf.SmsUser,conf.SmsPass,conf.SmsPatternId,conf.SmsNumber,conf.SmsUrl);
		console.log(`sms ${sms} is needed`);
                smsSender.sendSms(sms,req.body.mobilenumber,function(res){
			console.log(res);
		});
	        var corpid = '';
		if ( req.body.corpid ) 
			corpid = req.body.corpid;
		var sqlstrins = "insert into sessions (accountid,ticket , sms ,timereq,mobilenumber,nationalcode,fullname,personality,corpid) values (?,?,md5(?),now(),?,?,?,?,?)";
		var sqlstrupd = "update sessions set accountid=?, ticket=? , sms=md5(?) , timereq=now() , mobilenumber=? , fullname=?, personality=? , corpid=? where nationalcode=?";
		var sqlstrexi = "select * from sessions where nationalcode=? ";
		var valuesins = [ req.body.accountid,ticket,sms,req.body.mobilenumber,req.body.nationalcode,req.body.fullname,nationalChecker.personality,corpid ];
		var valuesupd = [ req.body.accountid,ticket,sms,req.body.mobilenumber,req.body.fullname,nationalChecker.personality,corpid,req.body.nationalcode ];
		var valuesexi = [ req.body.nationalcode ];
	        SqlQ.getConnection(function(err,SqlQC){
		SqlQC.query(sqlstrexi,valuesexi,function(err,result){
			console.log("sqlstr exists.");
			if (err) { SqlQC.release(); return  res.send(err);}
			if ( result.length ) {
			   	SqlQC.query(sqlstrupd,valuesupd,function(err,result){
					console.log("sqlstr update.");
					if (err) {SqlQc.release(); return  res.send(err);}
					SqlQC.commit(function(err) {
        				   if (err) {
          				     SqlQC.rollback(function() {
          				     });
						   console.log(err);
						   SqlQC.release();
					   return res.end(err);
        				 }});
					SqlQC.release();
					return res.end(ticket);
				});
			}else {
				SqlQC.query(sqlstrins,valuesins,function(err,result){
					console.log("sqlstr insert.");
					if (err) { SqlQC.release();return res.end(err);}
					SqlQC.commit(function(err) {
        				  if (err) {
          				    SqlQC.rollback(function() {
          				    });
						  SqlQC.release();
					  return res.end(err);
        				 }});
					SqlQC.release();
					return res.end(ticket);
				});
			}
		});
	});
	}else{
		console.log("request is not verified.");
		return res.status(400).end(JSON.stringify({message:'ap_request_not_verified'}));
	}
     }).catch(e=>{
	     console.log('[Error]'+e.message);
     });//isVerified
		  }//if user exist
			else{
				console.log("[ERROR]:request duplicate.");
				return res.status(400).end(JSON.stringify({message:'ap_request_duplicate'}));
			}
		});
	//DbCon.commit();
};

async function CreateAccount(accountID,additionalFee,sqlok,valueok,sqlrollback,valueback,callback){

	var source = StellarSdk.Keypair.fromSecret(secretKey);
	var destination= StellarSdk.Keypair.fromPublicKey(accountID);
	var transferAuth = new TransferAuthorize(SqlQ,StellarSdk,conf,server);
try{
await transferAuth.isNativePermitted(source.publicKey(),async (result)=>{
	if (result){
		await server.accounts()
	.accountId(source.publicKey())
	.call()
	.then(async ({ sequence }) => {
	  const account = new StellarSdk.Account(source.publicKey(), sequence)
	  const transaction = new StellarSdk.TransactionBuilder(account, {
		fee: conf.BaseFee+additionalFee,//StellarSdk.BASE_FEE,
		networkPassphrase: conf.NetworkPass//'Kuknos-NET'
	  })
		.addOperation(StellarSdk.Operation.createAccount({
		  destination: destination.publicKey(),
		  startingBalance: conf.CreateAmnt//'3'
		}))
		.setTimeout(0)
		.build();
	  transaction.sign(source);
	  //var valueins=[accountID,personality?nationalCode:corpID,conf.HomeDomain,mobileNumber,"",nationalCode,fullName,personality,corpID];
	   //console.log(sqlconfiguser);
	   //console.log(valueins);
			SqlQ.getConnection(async function(err,SqlQC){
		   await SqlQC.query(sqlok,valueok,async function(err,resultt){
		   if ( !err ){
		  await server.submitTransaction(transaction).then(async function(subresult){
			  notified_sms.set('PMN',true);
			console.log("submit trans create acc");
				await SqlQC.commit(function(err){});
			SqlQC.release();
			callback(true);
		}).catch(async function(error){
			console.log(error.response.data.extras.result_codes);
                                          if ( error.response.data.extras.result_codes && ((error.response.data.extras.result_codes.transaction == 'tx_failed' &&
                                                  error.response.data.extras.result_codes.operations[0] == 'op_underfunded')
						  || error.response.data.extras.result_codes.transaction == 'tx_insufficient_balance')	)
                                                        { sendCrtSms("Hi",'PMN'); }
			console.log("submitError==>"+error);
			await SqlQC.rollback(function(err){console.log(err)});
			await SqlQC.query(sqlrollback,valueback);
			SqlQC.release();
			callback(false,error);
		});
		   }else{
			   console.log('[SqlError]'+err);
			   SqlQC.release();
			   callback(false);
		   }
		  });//
		});//getconnection
		});
}else
	{
		console.log("[error-create-account]transfer from this sources is not permitted.");
		callback(false,JSON.stringify({message:'ap_transfer_not_permitted'}));
	}
});//
  }catch(errors){
	  console.log("[errors2]:"+errors);
	  callback(false);
		};
};

exports.manageUser = async function(req,res){
	console.log("manageUser start.");
	var accountID = req.body.accountid;
	var oldaccountID;
	var nationalCode = req.body.nationalcode;
	var oldnationalCode;
	var fullName = req.body.fullname;
	var oldfullName;
	var mobileNumber = req.body.mobilenumber;
	var oldmobileNumber;
	var corpID = req.body.corpid;
	var personality = req.body.personality;
	var additionalFee=0;
	var username = (personality?nationalCode:corpID);
	if ( req.body.additionalfee )
	additionalFee = parseInt(req.body.additionalfee);
	var duplicateCheckNeeded = parseInt(req.body.duplicatecheck) ;
	var SqlUser = "select * from users where username = ?";
	var sqlUserVal = [username];
	SqlQ.query( SqlUser , sqlUserVal ,async (err,resultuser)=>{
		if ( !resultuser.length || !duplicateCheckNeeded ){
			if ( resultuser.length ){
				var rows = resultuser[0];
				var sqlconfiguser= "insert into users (id,username,domain,mobilenumber,email,nationalcode,fullname,personality,corpid)values(?,?,?,?,?,?,?,?,?)";
				oldaccountID = rows.id;
				oldfullName = rows.fullname;
				oldmobileNumber = rows.mobilenumber;
				oldnationalCode = rows.nationalcode;
                if ( oldaccountID == accountID ){
					sqlconfiguser = "update users set mobilenumber = ? , nationalcode = ? , fullname = ? where id = ? ";
					var valueup = [mobileNumber,nationalCode,fullName,oldaccountID];
					SqlQ.query(sqlconfiguser,valueup,(err,ress)=>{
						console.log("user updated");
						return res.end(accountID);
					});
				}else{
					//create new acc and history oldacc , update user
					var sqlok = "update users set id = ? , mobilenumber = ? , nationalcode = ? , fullname  = ? where id = ?";
					var valueok = [accountID,mobileNumber,nationalCode,fullName,oldaccountID];
					var sqlrollback = "update users set id = ? , mobilenumber = ? , nationalcode = ? , fullname  = ? where id = ?";
					var valueback = [oldaccountID,oldmobileNumber,oldnationalCode,oldfullName,accountID];
					SqlQ.query("insert into users_history (id,username,fullname,nationalcode,mobilenumber ) values ( ?, ?, ?, ?, ? )",[oldaccountID,rows.username,oldfullName,oldnationalCode,oldmobileNumber],(err,logs)=>{console.log(err);});
					console.log(oldaccountID,rows.username,oldfullName,oldnationalCode,oldmobileNumber);
					await CreateAccount(accountID,additionalFee,sqlok,valueok,sqlrollback,valueback,async (resultCA,message)=>{
						if ( resultCA){
							return res.end(accountID);
						}else{
							return res.status(401).end(message);
						}
					});
				}
			}else{
				console.log("new user added");
				var sqlconfiguser= "insert into users (id,username,domain,mobilenumber,email,nationalcode,fullname,personality,corpid)values(?,?,?,?,?,?,?,?,?)";
				var valueins=[accountID,personality?nationalCode:corpID,conf.HomeDomain,mobileNumber,"",nationalCode,fullName,personality,corpID];
				var source = StellarSdk.Keypair.fromSecret(secretKey);
			  var destination= StellarSdk.Keypair.fromPublicKey(accountID);
			  var transferAuth = new TransferAuthorize(SqlQ,StellarSdk,conf,server);
		try{
		  await transferAuth.isNativePermitted(source.publicKey(),async (result)=>{
	          if (result){
	    	 	 await server.accounts()
			  .accountId(source.publicKey())
			  .call()
			  .then(async ({ sequence }) => {
		   	 const account = new StellarSdk.Account(source.publicKey(), sequence)
		    	const transaction = new StellarSdk.TransactionBuilder(account, {
		     	 fee: conf.BaseFee+additionalFee,//StellarSdk.BASE_FEE,
		     	 networkPassphrase: conf.NetworkPass//'Kuknos-NET'
		   	 })
		      	.addOperation(StellarSdk.Operation.createAccount({
		        	destination: destination.publicKey(),
		        	startingBalance: conf.CreateAmnt//'3'
		      	}))
		          .setTimeout(0)
		      	.build();
    			transaction.sign(source);
				var valueins=[accountID,personality?nationalCode:corpID,conf.HomeDomain,mobileNumber,"",nationalCode,fullName,personality,corpID];
				 console.log(sqlconfiguser);
				 console.log(valueins);
	                  SqlQ.getConnection(async function(err,SqlQC){
		             await SqlQC.query(sqlconfiguser,valueins,async function(err,resultt){
				     if ( !err ){
			        await server.submitTransaction(transaction).then(async function(subresult){
					  notified_sms.set('PMN',true);
					  console.log("submit trans create acc");
				          await SqlQC.commit(function(err){});
					  SqlQC.release();
					  return res.send(accountID);
				  }).catch(async function(error){
					  console.log(error.response.data.extras.result_codes);
                                          if ( error.response.data.extras.result_codes && ((error.response.data.extras.result_codes.transaction == 'tx_failed' &&
                                                  error.response.data.extras.result_codes.operations[0] == 'op_underfunded' )
						  || error.response.data.extras.result_codes.transaction == 'tx_insufficient_balance'))
						  { sendCrtSms("Hi",'PMN'); }
					  console.log("submitError==>"+error);
					  await SqlQC.rollback(function(err){console.log(err)});
					  await SqlQC.query("delete from users where id=? ",[accountID]);
					  SqlQC.release();
					  return res.status(406).send(error.response.data.extras.result_codes);
				  });
				     }else{
					     console.log('[SqlError]'+err);
					     SqlQC.release();
					     return res.status(406).send(JSON.stringify({message:'ap_user_duplicate'}));
				     }
			        });//
			      });//getconnection
          		});
		  }else
			  {
				  console.log("[error-create-account]transfer from this sources is not permitted.");
				  return res.status(401).send(JSON.stringify({message:'ap_transfer_not_permitted'}));
			  }
		  });//
			}catch(errors){
				console.log("[errors2]:"+errors);
				return res.status(404).end(errors);
			      };
			}
		}else {
			console.log("user duplicated");
			return res.status(400).end(JSON.stringify({message:'ap_request_duplicate',currentaccount:resultuser[0].id }));
		}
	});
};

exports.submitConfirm = async function(req,res){
		var ticket=req.body.ticket;
		var sms = req.body.sms;
		var sqlstr= "select * from sessions a where now() < timereq+"+conf.TimeOut+" and ticket=? and sms=md5(?) ";
	        var sqlconfiguser= "insert into users (id,username,domain,mobilenumber,email,nationalcode,fullname,personality,corpid)values(?,?,?,?,?,?,?,?,?)";
		var values = [ ticket,sms];
	        var asyncres = "";
		var additionalFee=0;
	        if ( req.body.additionalfee )
			additionalFee = parseInt(req.body.additionalfee);
		await SqlQ.query(sqlstr,values,async function(err,result){
			if (err){ 
				console.log("ticket is err.",err);
				//SqlQ.end();
				return  res.status(400).send("error");
			       }
			if (result.length ) {
			   var rows = result[0];
    			   console.log(rows);
			   //SqlQ.end();
	                  var source = StellarSdk.Keypair.fromSecret(secretKey);
			  var destination= StellarSdk.Keypair.fromPublicKey(rows.accountid);
			  var transferAuth = new TransferAuthorize(SqlQ,StellarSdk,conf,server);
		try{
		  await transferAuth.isNativePermitted(source.publicKey(),async function(result){
	          if (result){
	    	 	 await server.accounts()
			  .accountId(source.publicKey())
			  .call()
			  .then(async ({ sequence }) => {
		   	 const account = new StellarSdk.Account(source.publicKey(), sequence)
		    	const transaction = new StellarSdk.TransactionBuilder(account, {
		     	 fee: conf.BaseFee+additionalFee,//StellarSdk.BASE_FEE,
		     	 networkPassphrase: conf.NetworkPass//'Kuknos-NET'
		   	 })
		      	.addOperation(StellarSdk.Operation.createAccount({
		        	destination: destination.publicKey(),
		        	startingBalance: conf.CreateAmnt//'3'
		      	}))
		          .setTimeout(0)
		      	.build();
    			transaction.sign(source);
	                var sqlcorp = "select * from users where corpid=?  and personality = 0 ";
		        var sqlcorpval= [ rows.corpid ];
		        var valueins=[rows.accountid,rows.personality?rows.nationalcode:rows.corpid,conf.HomeDomain,rows.mobilenumber,"",rows.nationalcode,rows.fullname,rows.personality,rows.corpid];
	                await SqlQ.query( sqlcorp, sqlcorpval,async function(err,resultsql){
			 if ( resultsql.length ){
				 return  res.status(406).send(JSON.stringify({message:'ap_corpid_duplicate'}));
			 }else{
				 console.log(sqlconfiguser);
				 console.log(valueins);
	                  SqlQ.getConnection(async function(err,SqlQC){
		             await SqlQC.query(sqlconfiguser,valueins,async function(err,resultt){
				     if ( !err ){
			        await server.submitTransaction(transaction).then(async function(subresult){
					  notified_sms.set('PMN',true);
					  console.log("submit trans create acc");
				          await SqlQC.commit(function(err){});
					  SqlQC.release();
					  return res.send(rows.accountid);
				  }).catch(async function(error){
					  console.log(err.response.data.extras.result_codes);
                                          if ( err.response.data.extras.result_codes && ((err.response.data.extras.result_codes.transaction == 'tx_failed' &&
                                                  err.response.data.extras.result_codes.operations[0] == 'op_underfunded')
						  || err.response.data.extras.result_codes.transaction == 'tx_insufficient_balance' ))
                                                        { sendCrtSms("Hi",'PMN'); }
					  console.log("submitError==>"+error);
					  await SqlQC.rollback(function(err){console.log(err)});
					  await SqlQC.query("delete from users where id=? ",[rows.accountid]);
					  SqlQC.release();
					  return res.status(406).send(error.response.data.extras.result_codes);
				  });
				     }else{
					     console.log('[SqlError]'+err);
					     SqlQC.release();
					     return res.status(406).send(JSON.stringify({message:'ap_user_duplicate'}));
				     }
			        });//
			      });//getconnection
			    };//corp result
			  });//sqlcorp
          		});
		  }else
			  {
				  console.log("[error-create-account]transfer from this sources is not permitted.");
				  return res.status(401).send(JSON.stringify({message:'ap_transfer_not_permitted'}));
			  }
		  });//
			}catch(errors){
				console.log("[errors2]:"+errors);
				return res.status(404).end(errors);
			      };
			
			} else {
				console.log("ticket is invalid.");
				//SqlQ.end();
				//console.log("ticket is invalid2.");
				return res.status(404).send(JSON.stringify({message:'ap_ticket_invalid'}));
			}
		});
	//});
 };

exports.activeToken = async function (req,res){
	console.log(req.body.assetid);
	var additionalFee=0;
        if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var asset = new Assets(req.body.assetcode,req.body.assetissuer,req.body.assetid);
	var memotype = StellarSdk.MemoText;
	if ( req.body.memotype == 'hash' ) 
		memotype = StellarSdk.MemoHash;
	   if ( !req.body.memo )
		memotype = StellarSdk.MemoNone;
	var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	//var token = new StellarSdk.Asset('ABPA', issuingKeys.publicKey());
	var token  = asset.getAssetObj(SqlQ,async (token)=>{
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 

  await server.loadAccount(requested.publicKey())
    .then(function(receiver) {
      var transaction = new StellarSdk.TransactionBuilder(receiver, {
	memo: memoObj,
        fee: conf.BaseFee+additionalFee,
        networkPassphrase: conf.NetworkPass//'Kuknos-NET'
      })
        .addOperation(StellarSdk.Operation.changeTrust({
          asset: token 
          //,limit: '1000000'
        }))
        .setTimeout(0)
        .build();
         return  res.end(transaction.toXDR());
    }).catch(err=>{console.log(err)});
	});

};//end func

exports.activeWallet = async function (req,res){
	//var id= new Assets(req.body.assetcode,req.body.assetissuer);
	//var token = new StellarSdk.Asset('ABPA', issuingKeys.publicKey());
	//var token  = asset.getAssetObj();
	var additionalFee=0;
        if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 
	var memotype = StellarSdk.MemoText;
        if ( req.body.memotype == 'hash' )
                memotype = StellarSdk.MemoHash;
           if ( !req.body.memo )
                memotype = StellarSdk.MemoNone;
        var memoObj = new StellarSdk.Memo(memotype,req.body.memo);

  await server.loadAccount(requested.publicKey())
    .then(function(receiver) {
      var transaction = new StellarSdk.TransactionBuilder(receiver, {
	memo: memoObj,
	fee: conf.BaseFee+additionalFee,
        networkPassphrase: conf.NetworkPass//'Kuknos-NET'
      })
        .addOperation(StellarSdk.Operation.setOptions({
		homeDomain:conf.HomeDomain,
		inflationDest:conf.Inflation
        }))
        .setTimeout(0)
        .build();
         return  res.end(transaction.toXDR());
    });

};//end func

exports.listOfAssets = function(req,res){
	var sqlstr = "select assetissuer,assetcode,id from assets ";
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
	if (parseInt(amount)<= conf.TransferLimit){
	var additionalFee=0;
        if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var asset = new Assets(req.body.assetcode,req.body.assetissuer,req.body.assetid);
	var assetObj; 
	var memotype = StellarSdk.MemoText;
        if ( req.body.memotype == 'hash' )
                memotype = StellarSdk.MemoHash;
           if ( !req.body.memo )
                memotype = StellarSdk.MemoNone;
        var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	
	assetObj = await asset.getAssetObj(SqlQ,async function(assetObj){ //});//.then(async assetObj =>{ //assetObj=result 
	//});
	console.log(assetObj);
	await destinationID.getAccountID(SqlQ, async function(destinationid){
		console.log("==>"+destinationid+"<==");
		if ( !destinationid )
			return res.status(404).end(JSON.stringify({message:'ap_dest_not_found'}));
			{
			console.log(assetObj,accountID);
			const accountSrc = await server.loadAccount(accountID).then(accountSrc =>{
			//.catch(errors=>{
				//console.log("account error: ", errors);
				//return res.status(404).end("Account not found");
			//});
			const transaction = new StellarSdk.TransactionBuilder(accountSrc, {
				memo: memoObj,
				fee:conf.BaseFee+additionalFee,
				networkPassphrase: conf.NetworkPass
			}).addOperation(StellarSdk.Operation.payment({
					destination: destinationid,
				asset: assetObj,//asset.getAssetObj(SqlQ),
				amount:amount,
			})).setTimeout(0)
			.build();
			return res.end(transaction.toXDR('base64'));
			}).catch(errors=>{
							console.log("account error: ", errors);
							return res.status(404).end(JSON.stringify({message:'ap_src_not_found'}));
					});
			}
		});
	});
	}else{
                console.log("exceed limit transfer");
                return res.status(400).end(JSON.stringify({message:'ap_exceed_limit_transaction'}));
        }

};//end func

exports.buyAssetsTrustNeed = async function(sourcefeeid,sourceid,sequence,req,callback){

	var accsource = new KuknosID(sourceid);
	var accountSrc;
	var additionalFee=0;
        if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	accsource.getAccountID(SqlQ, (sourceID)=>{
	  if (sourceID){
  	   accountSrc = new StellarBase.Account(sourcefeeid,sequence);
	   var  destinationID = new KuknosID(req.body.destinationid);
           var amount = req.body.amount;
           var asset  = new Assets(req.body.assetcode,req.body.assetissuer,req.body.assetid);
           console.log("buy asset for :"+req.body.destinationid);
           //var sourceKeyIssuer = StellarSdk.Keypair.fromSecret(secretKey);
           var transferAuth = new TransferAuthorize(SqlQ,StellarSdk,conf,server);
           var memotype = StellarSdk.MemoText;
           if ( req.body.memotype == 'hash' )
                 memotype = StellarSdk.MemoHash;
           if ( !req.body.memo )
                 memotype = StellarSdk.MemoNone;
           var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
           //var destination= StellarSdk.Keypair.fromPublicKey(rows.accountid);
           //find id in table
	   var truster = asset.getAssetTruster(SqlQ,(truster)=>{
	   if ( truster ){
	       console.log(truster);
               var signtruster = null;
               var assetObj= asset.getAssetObj(SqlQ, async (assetObj)=>{
               if ( !assetObj.isNative() && truster != "-" ) //only for my tokens
	          signtruster= StellarSdk.Keypair.fromSecret(truster);
               await transferAuth.isAssetPermitted(sourceID,amount,assetObj,async function(results){
                 if (results){
                 await destinationID.getAccountID(SqlQ, async function(destinationid){
                   if ( destinationid ){
	              var trans = new StellarBase.TransactionBuilder(accountSrc,{
 		        memo:memoObj,
		        fee:conf.BaseFee+additionalFee,
		        //timebounds:{maxTime:},
		        networkPassphrase:conf.NetworkPass
	              });
	             if( assetObj.isNative() ){
			     if ( parseFloat(amount) > parseFloat(conf.NativeLimitAmnt ))
                             {
                                     console.log("exceed limit transaction");
                                     callback(400,JSON.stringify({message:'ap_exceed_limit_transaction'}));
                             }
		       trans.addOperation(StellarSdk.Operation.payment({
                          destination:destinationid,
                          asset:assetObj,
                          amount:amount,
			  source:sourceID
                     }))
	           }else{
	             trans/*.addOperation(StellarSdk.Operation.allowTrust({
			trustor:destinationid,
			assetCode:assetObj.getCode(),
			authorize:true,
			source:assetObj.getIssuer()
		}))*/
		.addOperation(StellarSdk.Operation.payment({
			destination:destinationid,
			asset:assetObj,
			amount:amount,
			source:sourceID
		}))/*
		.addOperation(StellarSdk.Operation.allowTrust({
			trustor:destinationid,
                        assetCode:assetObj.getCode(),
                        authorize:false,
                        source:assetObj.getIssuer()
		}))*/
	     }//operation added
		var inTrans = trans.setTimeout(parseInt(conf.TimeOut)).build();
		     //if ( signtruster )	   
		     //     inTrans.sign(signtruster);
		     callback(null,inTrans.toXDR('base64'));
		   }//if destinationid
			else
			callback( 404,JSON.stringify({message:'ap_dest_not_found'}));
		  })//getAccountid
	        }//if permitted
		 else 
		  callback(401,JSON.stringify({message:'ap_transfer_asset_not_permitted'}));
	       })//assetPermitted
	      })//getAssetObj
	     }//if truster
		else
			callback(400,JSON.stringify({message:'ap_truster_not_define'}));
	    })//getTruster
	  }//if sourceID
		else 
			callback(400,JSON.stringify({message:'ap_src_not_found'}));
	})//getsourceID

};
exports.buyAssetsThird = async function(req,res){
	var sourceid = req.body.tokensourceid;
	var sequencein = req.body.txsourcesequence;
	var sourcefeeID = req.body.txsourceid;
	if ( !sourceid )
		sourceid=sourcefeeID;
	var sourceFeeid= new KuknosID(sourcefeeID);
	sourceFeeid.getAccountID(SqlQ, async (sourceFeeID)=>{
         if ( sourceFeeID) {
	   var sequence = (new BigNumber(sequencein)).sub(1).toString();
	   console.log(`Sequence ${sequencein} `);
           if ( sourceid == sourcefeeID )
		 sourceid = sourceFeeID;
	   await buyAssetsTrustNeed(sourceFeeID,sourceid,sequence,req, async (err,result)=>{
		console.log(`Transaction response ${err} and ${result} `);
		if ( err ) 
			return  res.status(401).send(result);
		return res.end(result);
	   });
	 }else{
		 return res.status(401).send(JSON.stringify({message:'ap_src_not_found'}));
	 }
	});
};

exports.TransInquiry= async function (req,res){
	var sqlstr = "select * from buyrequest where requestid=? "
        var values = [req.body.requestid];
        if ( req.body.destinationid ) {
                 sqlstr = "select * from buyrequest  where requestid=? and destinationid=?";
                 values = [req.body.requestid,req.body.destinationid];
        }
	SqlQ.query(sqlstr,values,(err,result)=>{
		if (err)
			return res.status(401).send("Internal server error");
		if ( result.length )
			if(result[0].status=='success') 
			   return res.send("success");
			else if ( result[0].status=='fail' )
			   return res.send("fail");
			else 
			   return res.send("unknown");
		else 
			return res.send("notfound");
	})
};

exports.buyAssets = async function(req,res){
	var sourceID= publicKey;
	var srcAcc = await server.loadAccount(sourceID);
	var sequence=srcAcc.sequenceNumber();
	var source = StellarSdk.Keypair.fromSecret(secretKey);
	var id = req.body.requestid;
        var sqlStr = " select * from buyrequest where requestid=? and destinationid=? "; 
	var insSqlStr="insert into buyrequest (requestid,destinationid) values(?,?)";
	var Values=[id,req.body.destinationid];
	var updateStr="update buyrequest set status='success' where requestid=? and destinationid=?";
	var updateErrStr="update buyrequest set status='fail' where requestid=? and destinationid=?";
	SqlQ.query(sqlStr,Values,async (err,resultid)=>{
	if ( resultid.length || err ){
		return res.status(401).send(JSON.stringify({message:'ap_transaction_duplicate'}));
	}else{
	    try{
		SqlQ.query(insSqlStr,Values, async (error,results)=>{
			if (error )
				return  res.status(401).end("Internal server Error.");
			await this.buyAssetsTrustNeed(sourceID,sourceID,sequence,req, async (err,result)=>{
			if ( err ) {
				console.log(result);
				SqlQ.query(updateErrStr,Values,(errm,ress)=>{
                                	console.log(errm);
                        	});
				return res.status(err).send(result);
			}else {
				var trans = new StellarBase.Transaction(result,conf.NetworkPass); 
				trans.sign(source);

				//console.log(trans.toXDR('base64'));
				await server.submitTransaction(trans).then(subres=>{
					notified_sms.set('PMN', true );
					notified_sms.set(req.body.assetcode, true );
			                SqlQ.query(updateStr,Values,async (error,results)=>{
						if (error ){
							console.log(`[ERROR]${error}`);
							return  res.status(401).end("Internal server error");
				  		  }else
			           		     return res.send(subres.ledger.toString());
				   	})
				  }).catch(err=>{
					console.log(err.response.data.extras.result_codes);
                                          if ( err.response.data.extras.result_codes && ((err.response.data.extras.result_codes.transaction == 'tx_failed' &&
                                                  err.response.data.extras.result_codes.operations[0] == 'op_underfunded') ) )
						  sendCrtSms("Hi",req.body.assetcode);
					  else if ( err.response.data.extras.result_codes && 
					  	 err.response.data.extras.result_codes.transaction == 'tx_insufficient_balance')
                                                        { sendCrtSms("Hi",'PMN'); }					  
				    console.log(`[TransERROR] ${JSON.stringify(err)}`);
				    SqlQ.query(updateErrStr,Values,(errm,ress)=>{
                                	console.log(errm);
                        		});
                                    return res.status(401).json(err);
			     	})
			   }
			});
		});
	    }catch(error){
		   SqlQ.query(updateErrStr,Values,(err,ress)=>{
			  	console.log(error); 
				return res.status(401).end(error);
		   	});
	    }
	  }
     });
};

exports.federation = function(req,res){
	var values=req.query.q.split("*");
	if ( req.query.type ){
		if ( req.query.type=="name" ){
			var sqlstr="select id from users where username=? and domain=? ";
			SqlQ.query(sqlstr,values,function(err,result){
                		if ( err ) console.log(err.message);
		                if ( result ){
		                        var userInfoJson = result[0];
					return  res.json(userInfoJson);
				}else 
					return res.status(404).end("not found");
			});
		}else if ( req.query.type=="id" ){
			var sqlstr="select username kuknos_id from users where id=?";
			//console.log(values);
			SqlQ.query(sqlstr,values,function(err,result){
		                if ( err ) console.log(err.message);
		                if ( result ) {
		                        var userInfoJson = result[0];
					return res.json(userInfoJson);
				}else
					return res.status(404).end("not found");
			});
		}else
			return res.status(400).end("type not support");
	}else
		return res.status(400).end("type not support");
};//end func

exports.statement = async function(req,res){
  var i=0;
  var result=[];
  var found=true;
  var offset='now';
  var length = 10;
  var assetCode = "";
  var assetType = "";
  var order = "desc";
  var paymentType = "";
  if ( req.body.order )
  	order = req.body.order;
  if ( req.body.offset ) 
	offset=req.body.offset;
  if ( req.body.length )
	length = parseInt(req.body.length);
  if ( req.body.assetcode )
	assetCode= req.body.assetcode;
  if (assetCode == "PMN" ) 
	assetType="native";
  if ( req.body.paymenttype )
	paymentType = req.body.paymenttype;
  var myPublicKey = req.body.accountid;
  var paymentCall = await server_statement.payments()
        .forAccount(myPublicKey)
        .limit(100)
        .order(order);
        do {
                found=false;
        	await paymentCall
                .cursor(offset)
                .call()
        	.then( async (page)=>{
                var j=0;
		for ( j =0; j< page.records.length ; j++){
                        if ( i >= length ) break;
                        if(page.records[j].type=="payment"){
                                found = true;
                                if( assetCode != "" )
                                {
                                        if (( page.records[j].asset_type == assetType )
                                                || ( page.records[j].asset_type !="native" && page.records[j].asset_code == assetCode ))
                                        {
                                                found=true;
                                        }else
                                                found=false;
                                }

                                if ( paymentType != "" && found )
                                {
                                        if ( paymentType == "from" ) {
                                                if( page.records[j].from == myPublicKey )
                                        {
                                                found=true;
                                        }else
                                                found=false;
                                        }else if (paymentType == "to" &&  page.records[j].to == myPublicKey )
                                        {
                                                found=true;
                                        }else
                                                found=false;
                                }
                                if ( found )
                                {
                                        i++;
                                        result.push(page.records[j]);
                                }
                        }
                        offset=page.records[j].paging_token;
		}
        	});

		
        }while(i<length && found );

	return res.end(JSON.stringify(result));
};

exports.chargeaccount = async function(req,res){
	var assetCode = req.body.assetcode;
	var assetIssuer = req.body.assetissuer;
	var srcAccount ;
	var destinationId = req.body.destinationid;
	console.log("chargeaccount start.");
	var  amount = req.body.amount;
	if ( assetCode == "PMN" ){
		srcAccount = PMNPublicSrc;
	}else{
		srcAccount = TokenPublicSrc;
	}
	var asset = new Assets(assetCode,assetIssuer,req.body.assetid);
	var memotype = StellarSdk.MemoText;
    if ( req.body.memotype == 'hash' )
        memotype = StellarSdk.MemoHash;
    if ( !req.body.memo )
        memotype = StellarSdk.MemoNone;
    var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	
	var assetObj = await asset.getAssetObj(SqlQ,async function(assetObj){

	    	//console.log(assetObj);
		//console.log(assetObj,accountID);
		const accountSrc = await server.loadAccount(srcAccount).then(accountSrc =>{
		//.catch(errors=>{
			//console.log("account error: ", errors);
			//return res.status(404).end("Account not found");
		//});
		const transaction = new StellarSdk.TransactionBuilder(accountSrc, {
			memo: memoObj,
			fee:conf.BaseFee,
			networkPassphrase: conf.NetworkPass
		}).addOperation(StellarSdk.Operation.payment({
      			destination: destinationId,
			asset: assetObj,
			amount:amount,
		})).setTimeout(0)
		.build();
		return res.end(transaction.toXDR('base64'));
		}).catch(errors=>{
                        console.log("account error: ", errors);
                        return res.status(404).end(JSON.stringify({message:'ap_src_not_found'}));
                });
	});
};//end func charge

exports.tokenreport = async function(req,res){
	var resultjson = new Object(); //="{}";
	var rrj = [];
	var totaljson;
	//resultjson['records']=[];
	var balancemin=0;
	var mysqlquery= "select concat(username,'*',domain) username,mobilenumber,email,nationalcode,fullname,personality,corpid from users where id=?";
	var assetCode = req.body.assetcode;
	var assetIssuer = req.body.assetissuer;
	var offset = req.body.offset;
	var limit  = req.body.length;
	var asset = new Assets(assetCode,assetIssuer);
	var assetObj = asset.getAssetObj(SqlQ,async function(assetObj){
		asset.getDecimal(server,async function(decimalAsset){
			console.log(`getdecimalcall is ${decimalAsset}`);
			//balancemin = 10000000/decimalAsset;
			balancemin=0;
			var coresql="select a.accountid,a.balance/10000000.0 balance ,convert_from(decode(b.homedomain,'base64'),'UTF8') homedomain from trustlines a, accounts b where a.assetcode=$1 and a.balance>$2 and  a.accountid=b.accountid and a.issuer=$3 limit $4 offset $5";
			var coresqlcnt = "select count(*) total from trustlines a, accounts b where a.assetcode=$1 and a.balance>$2 and  a.accountid=b.accountid and a.issuer=$3 ";
			PgSql.query(coresqlcnt,[assetCode,balancemin,assetIssuer]).then(async restotal=>{
				resultjson.total=restotal.rows[0].total;
				console.log(restotal.rows[0].total);
				if ( !req.body.offset || !req.body.len )
				{
					offset = 0;
					limit = restotal.rows[0].total;
					console.log('get_total_records');
				}
			PgSql.query(coresql,[assetCode,balancemin,assetIssuer,limit,offset]).then(async results=>{
				for (let inrow of results.rows) {
					totaljson = "";//= resultjson;
					totaljson = {...totaljson, ...inrow};
					if ( inrow.homedomain == conf.HomeDomain){
						var valueqr = [inrow.accountid];
						const mresult = await SqlQSync.execute(mysqlquery,valueqr );
							if ( mresult.length ){
								var  totals = totaljson;
								totaljson = {...totals, ...mresult[0][0]};
							}
						};
						  rrj.push(totaljson);
						resultjson.records=rrj;
				}
				console.log("----------------------------------------------------");
				return  res.json(resultjson);
			});
		    });//total
		});
	});
};//end tokenreport

exports.manageBuyOffer = async function(req,res){
	var sellingcode = req.body.sellCode;
	var sellingissuer = req.body.sellissuer;
	var buyingcode = req.body.buycode;
	var buyingissuer = req.body.buyissuer;
	var buyamount = req.body.amount;
	var buyprice = req.body.price;
	var offerID = 0;
	if ( req.body.offerid )
		offerID=req.body.offerid;
	var additionalFee=0;
    if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 
	var memotype = StellarSdk.MemoText;
    if ( req.body.memotype == 'hash' )
        memotype = StellarSdk.MemoHash;
    if ( !req.body.memo )
        memotype = StellarSdk.MemoNone;
    var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	var selling = new Assets(sellingcode,sellingissuer);
	var buying = new Assets(buyingcode,buyingissuer);
	selling.getAssetObj(SqlQ, async sellAsset => {
		buying.getAssetObj(SqlQ, async buyAsset => { 
			await server.loadAccount(requested.publicKey())
			.then(function(receiver) {
			  var transaction = new StellarSdk.TransactionBuilder(receiver, {
			memo: memoObj,
			fee: conf.BaseFee+additionalFee,
				networkPassphrase: conf.NetworkPass
			  })
				.addOperation(StellarSdk.Operation.manageBuyOffer({
				selling:sellAsset,
				buying:buyAsset,
				buyAmount:buyamount,
				price:buyprice,
				offerId:offerID
				}))
				.setTimeout(0)
				.build();
				 return  res.end(transaction.toXDR());
			});			
		}); 
	});
};//end mamangebuyoffer

exports.manageSellOffer = async function(req,res){
	var sellingcode = req.body.sellCode;
	var sellingissuer = req.body.sellissuer;
	var buyingcode = req.body.buycode;
	var buyingissuer = req.body.buyissuer;
	var buyamount = req.body.amount;
	var buyprice = req.body.price;
	var offerID = 0;
	if ( req.body.offerid )
		offerID=req.body.offerid;
	var additionalFee=0;
    if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 
	var memotype = StellarSdk.MemoText;
    if ( req.body.memotype == 'hash' )
        memotype = StellarSdk.MemoHash;
    if ( !req.body.memo )
        memotype = StellarSdk.MemoNone;
    var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	var selling = new Assets(sellingcode,sellingissuer);
	var buying = new Assets(buyingcode,buyingissuer);
	selling.getAssetObj(SqlQ, async sellAsset => {
		buying.getAssetObj(SqlQ, async buyAsset => { 
			await server.loadAccount(requested.publicKey())
			.then(function(receiver) {
			  var transaction = new StellarSdk.TransactionBuilder(receiver, {
			memo: memoObj,
			fee: conf.BaseFee+additionalFee,
				networkPassphrase: conf.NetworkPass
			  })
				.addOperation(StellarSdk.Operation.manageSellOffer({
				selling:sellAsset,
				buying:buyAsset,
				amount:buyamount,
				price:buyprice,
				offerId:offerID
				}))
				.setTimeout(0)
				.build();
				 return  res.end(transaction.toXDR());
			});			
		}); 
	});
};//end manageselloffer

exports.createPassiveSellOffer = async function(req,res){
	var sellingcode = req.body.sellCode;
	var sellingissuer = req.body.sellissuer;
	var buyingcode = req.body.buycode;
	var buyingissuer = req.body.buyissuer;
	var buyamount = req.body.amount;
	var buyprice = req.body.price;
	var additionalFee=0;
    if ( req.body.additionalfee )
		additionalFee = parseInt(req.body.additionalfee);
	var requested = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 
	var memotype = StellarSdk.MemoText;
    if ( req.body.memotype == 'hash' )
        memotype = StellarSdk.MemoHash;
    if ( !req.body.memo )
        memotype = StellarSdk.MemoNone;
    var memoObj = new StellarSdk.Memo(memotype,req.body.memo);
	var selling = new Assets(sellingcode,sellingissuer);
	var buying = new Assets(buyingcode,buyingissuer);
	selling.getAssetObj(SqlQ, async sellAsset => {
		buying.getAssetObj(SqlQ, async buyAsset => { 
			await server.loadAccount(requested.publicKey())
			.then(function(receiver) {
			  var transaction = new StellarSdk.TransactionBuilder(receiver, {
			memo: memoObj,
			fee: conf.BaseFee+additionalFee,
				networkPassphrase: conf.NetworkPass
			  })
				.addOperation(StellarSdk.Operation.createPassiveSellOffer({
				selling:sellAsset,
				buying:buyAsset,
				amount:buyamount,
				price:buyprice
				}))
				.setTimeout(0)
				.build();
				 return  res.end(transaction.toXDR());
			});			
		}); 
	});
};//end managepassiveselloffer

exports.myOffers = async function(req,res){
	//
	var accountid = StellarSdk.Keypair.fromPublicKey(req.body.accountid); 
	await server.offers()
	.forAccount(accountid)
	.call().then(offers=>{
		console.log(offers);
		return res.end(JSON.stringify(offers));
	});
};//end myoffers

exports.orderbook = async function(req,res){
	var buycode = req.body.buyingcode;
	var buyissuer = StellarSdk.Keypair.fromPublicKey(req.body.buyingissuer); 
	var sellcode = req.body.sellingcode;
	var sellissuer = StellarSdk.Keypair.fromPublicKey(req.body.sellingissuer); 
	var selling = new Assets(sellcode,sellissuer);
	var buying = new Assets(buycode,buyissuer);
	selling.getAssetObj(SqlQ, async sellAsset => {
		buying.getAssetObj(SqlQ, async buyAsset => {
			await server.orderbook(sellAsset,buyAsset)
			.call().then(orderbooks =>{
				return res.end(JSON.stringify(orderbooks));
			});
		});
	});
};//end orderbook

exports.tradeAggregation = async function(req,res){
	var basecode = req.body.basecode;
	var baseissuer = req.body.baseissuer;
	var countercode = req.body.countercode;
	var counterissuer = req.body.counterissuer;
	var starttime = parseInt(req.body.starttime);
	var endtime = parseInt(req.body.endtime);
	var resolution = Number(req.body.resolution);
	var baseasset = new Assets(basecode,baseissuer);
	var offset=0;
	var counterasset = new Assets(countercode,counterissuer);
	baseasset.getAssetObj(SqlQ, async baseAsset=>{
		counterasset.getAssetObj(SqlQ,async counterAsset=>{
			await server.tradeAggregation(baseAsset,counterAsset,starttime,endtime,resolution,offset)
			.call().then( tradeaggre => {
				return res.end(JSON.stringify(tradeaggre));
			});
		});
	});
};

exports.allTrades = async function(req,res){
	var basecode = req.body.basecode;
	var baseissuer = req.body.baseissuer;
	var countercode = req.body.countercode;
	var counterissuer = req.body.counterissuer;
	var offerID = req.body.offerid;
	var accountID = req.body.accountid;
	var baseasset = new Assets(basecode,baseissuer);
	var counterasset = new Assets(countercode,counterissuer);
	var alltrades =  server.trades();
	if ( basecode || countercode ){
		baseasset.getAssetObj(SqlQ, async baseAsset=>{
			counterasset.getAssetObj(SqlQ,async counterAsset=>{
				alltrades.forAssetPair(baseAsset,counterAsset);
			});
		});
	}
	if ( offerID )
		alltrades.forOffer(offerID);
		
	if ( accountID )
		alltrades.forAccount(accountID);

	alltrades.call().then( alltrade => {
		return res.end(JSON.stringify(alltrade));
	});

};//end allTrade
