
class TransferAuthorize{
	constructor ( sqlq, stellarsdk ,conf,server){
		this.SqlQ=sqlq;
		this.StellarSdk=stellarsdk;
		this.conff=conf;
		this.server=server;
	}

	async amountDecimalControl(amount,asset,callback){
	  var result = true;
		await this.server.accounts()
	        .accountId(asset.getIssuer())//StellarSdk.Keypair.fromPublicKey(publicKey))
                .call()
                .then(async function(results) {
		  await this.StellarSdk.StellarTomlResolver.resolve(results.home_domain).then(response => {
	         	  response.CURRENCIES.forEach(element => {
	            	       if ( element.code!=asset.getCode() )
	                	           return;
	               	 	if (parseInt(amount.substr(-7+element.display_decimals))!=0)
	        	                result=false;
	        	   });
	  	 });
	  	callback(result);
		});
	}

	async isNativePermitted(srcTrns,callback){
 		if (this.conff.SourceControl &&  this.conff.NativeControl )
                        {
                                //throw "Not Permited";
                                var sqlControl = "select * from validsource a where a.accountid=? and a.assetid is null";
                                var valuess=[srcTrns];
                                await this.SqlQ.query( sqlControl,valuess,function(err,result){
                                        if (err) callback(false);
                                        if ( !result.lenght )
                                                callback(false);

                                });
                         }
		callback( true );
	}
        async isAssetPermitted(srcTrns,amount,asset,callback){
		var permitted= true;
		await amountDecimalControl(amount,asset,async function(amresult){
	        if ( amresult ) {
			if ( this.conff.SourceControl ) {
				assetcodeFilter=asset.getCode();
				assetissuFilter=asset.getIssuer();
				sqlstr="select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                        	values = [srcTrns,assetcodeFilter,assetissuFilter];
				await this.SqlQ.query(sqlstr,values,function(err,result){
                	                        if (err) {console.log(err);permitted=false;}
          	                              if (!result.length )
                                        	        permitted = false;
						callback(permitted);
                        	        });
			}else
				callback(permitted);
		}else{
			callback(false);
		}
	});
}

	async isOperationPermitted(srcTrns,operations, callback){
		 var inamount;
		 if ( this.conff.SourceControl ){
                //var operations = transaction.toEnvelope().tx().operations();
                  var transferNotPermited=false;
                  operations.forEach(async element=>{
                          if (!transferNotPermited){
                          var assetcodeqry;
                          var assetissuqry;
                          var asstcodeFilter;
                          var asstissuFilter;
                          var sqlstr;
                          var values;
                        try{
				var inAsset = this.StellarSdk.Asset.fromOperation(element.body().paymentOp().asset());
				inamount = element.body().paymentOp().amount();
                                if ( inAsset.isNative()){
                                        if ( this.conff.NativeControl ){
                                                sqlstr = "select * from validsource a where a.accountid=? and a.assetid is null";
                                                values = [srcTrns];
                                        }else
                                                return;
                                }else{
                                        asstcodeFilter=inAsset.getCode();
                                        asstissuFilter=inAsset.getIssuer();
                                        sqlstr = "select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                                        values = [srcTrns,asstcodeFilter,asstissuFilter];
                                }
                                await this.SqlQ.query(sqlstr,values,async function(err,result){
                                        if (err) return console.log(err);
                                        if (!result.length )
                                                transferNotPermited = true;
					else if ( !inAsset.isNative() ){
					 await amountDecimalControl(inamount,inAsset,function(inresult){
						 transferNotPermited = inresult;
					 });
					}
                                });

                        }catch(e){
                        }
                  }
                });//foreach
                callback( !transferNotPermited );
          }//end if control
		else callback( true) ;//res.status(403).end("Transaction not permitted");
	}
}

module.exports = TransferAuthorize;
