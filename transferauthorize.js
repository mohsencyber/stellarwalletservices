
class TransferAuthorize{
	constructor ( sqlq, stellarsdk ,conf,server){
		this.SqlQ=sqlq;
		this.StellarSdk=stellarsdk;
		this.conff=conf;
		this.server=server;
	}

      async  amountDecimalControl(amount,asset,StellarSdk,server,callback){
	  var result = true;
		console.log(`amountDecimal Control ${amount}`);
		await server.accounts()
	        .accountId(asset.getIssuer())//StellarSdk.Keypair.fromPublicKey(publicKey))
                .call()
                .then(async (results)=> {
		  await StellarSdk.StellarTomlResolver.resolve(results.home_domain).then(response => {
			  callback( response.CURRENCIES.find(element => {
	            	       if ( element.code==asset.getCode() ){
				 var crcamount = parseFloat(amount)*Math.pow(10,element.display_decimals);
	               	 	 //if (parseInt(amount.substr(-7+element.display_decimals))==0)
	               	 	 if (crcamount - parseInt(crcamount) == 0)
				        return true ;
				  else 
					return false ;
			       }
	        	   }) )  
	  	 });
	     });
	}


	async isNativePermitted(srcTrns,callback){
 		if (this.conff.SourceControl &&  this.conff.NativeControl )
                        {
                                //throw "Not Permited";
                                var sqlControl = "select * from validsource a where a.accountid=? and a.assetid is null";
                                var valuess=[srcTrns];
                                await this.SqlQ.query( sqlControl,valuess,(err,result)=>{
                                        if (err) callback(false);
                                        if ( !result.lenght )
                                                callback(false);

                                });
                         }
		callback( true );
	}
        async isAssetPermitted(srcTrns,amount,asset,callback){
		var permitted= true;
	        console.log("isAssetPermitted call");
		if ( !asset.isNative() ){
		await this.amountDecimalControl(amount,asset,this.StellarSdk,this.server,async (amresult)=>{
	        if ( amresult ) {
			if ( this.conff.SourceControl ) {
				var assetcodeFilter=asset.getCode();
				var assetissuFilter=asset.getIssuer();
				var sqlstr="select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                        	var values = [srcTrns,assetcodeFilter,assetissuFilter];
				await this.SqlQ.query(sqlstr,values,(err,result)=>{
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
	}else {
		if ( this.conff.NativeControl ){
			var sqlstr = "select * from validsource a where a.accountid=? and a.assetid is null";
                        var values = [srcTrns];
			await this.SqlQ.query( sqlStr,values,(err,result)=>{
				if ( err ) { console.log(err);permitted=false;}
				if ( !result.length )
					permitted = false;
				callback(permitted);
			});
		}else{
			callback(permitted);
		}
	}
}

	async isOperationPermitted(srcTrns,operations, callback){
		 var inamount;
                  var transferNotPermited=false;
		 console.log("OperationPermitted call");
                //var operations = transaction.toEnvelope().tx().operations();
                  if ( operations.find(async element=>{
			  
                        try{
			  var inAsset = this.StellarSdk.Asset.fromOperation(element.body().paymentOp().asset());
			  inamount = element.amount.toString();//element.body().paymentOp().amount().low.toString();
		  if ( this.conff.SourceControl ){
                          var assetcodeqry;
                          var assetissuqry;
                          var asstcodeFilter;
                          var asstissuFilter;
                          var sqlstr;
                          var values;
			  //transferNotPermited = false;
				//console.log("-(",inamount,inAsset,")-");
                                if ( inAsset.isNative()){
                                        if ( this.conff.NativeControl ){
                                                sqlstr = "select * from validsource a where a.accountid=? and a.assetid is null";
                                                values = [srcTrns];
                                        }else
                                                return false;
                                }else{
                                        asstcodeFilter=inAsset.getCode();
                                        asstissuFilter=inAsset.getIssuer();
                                        sqlstr = "select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                                        values = [srcTrns,asstcodeFilter,asstissuFilter];
                                }
                                await this.SqlQ.query(sqlstr,values,async (err,result)=>{
                                        if (err) return false;//console.log(err);
                                        if (result.length ){
					if ( !inAsset.isNative() ){
					  await this.amountDecimalControl(inamount,inAsset,this.StellarSdk,this.server,(inresult)=>{
						 transferNotPermited = !inresult;
						  //console.log("decimal amount is ",inresult);
						  return transferNotPermited;
					  });
					 }
					}else{
						transferNotPermited = true;
						return true;
					}
                                });

	         }else{
			 if ( !inAsset.isNative() ){
                                 await this.amountDecimalControl(inamount,inAsset,this.StellarSdk,this.server,(inresult)=>{
                                            transferNotPermited = !inresult;
					    return transferNotPermited;
                                      });
                               }
		 }
                        }catch(e){
                        }
                }) ) {//foreach->find
			console.log("TransferNotPermited .",!transferNotPermited);
			  callback( !transferNotPermited )
		  }else
			callback( !transferNotPermited );
	}
}

module.exports = TransferAuthorize;
