
class TransferAuthorize{
	constructor ( sqlq, stellarsdk ,conf,server){
		this.SqlQ=sqlq;
		this.StellarSdk=stellarsdk;
		this.conff=conf;
		this.server=server;
	}

      async  amountDecimalControl(amount,asset,StellarSdk,server,callback){
	  var result = false;
		console.log(`amountDecimal Control ${amount}`);
		await server.accounts()
	        .accountId(asset.getIssuer())//StellarSdk.Keypair.fromPublicKey(publicKey))
                .call()
                .then(async (results)=> {
		  await StellarSdk.StellarTomlResolver.resolve(results.home_domain).then( async response => {
			  callback(await  response.CURRENCIES.find(element => {
	            	       if ( element.code==asset.getCode() ){
				 var crcamount = parseFloat(amount)*Math.pow(10,element.display_decimals);
	               	 	 //if (parseInt(amount.substr(-7+element.display_decimals))==0)
	               	 	 if (crcamount - parseInt(crcamount) == 0){
				        return true;
				 }else 
					return false ;
			       }
	        	   }) );
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
		 console.log(operations);

		 var element = operations.pop();
		 while( element ){
			 console.log(element);  
                        try{
			  inamount = element.amount.toString();//element.body().paymentOp().amount().low.toString();
				console.log(inamount);
			  var inAsset = new this.StellarSdk.Asset(element.asset.code,element.asset.issuer);//.fromOperation(element);
		  if ( this.conff.SourceControl ){
                          var asstcodeFilter;
                          var asstissuFilter;
                          var sqlstr;
                          var values;
                                if ( inAsset.isNative()){
                                        if ( this.conff.NativeControl ){
                                                sqlstr = "select * from validsource a where a.accountid=? and a.assetid is null";
                                                values = [srcTrns];
                                        }else{ element = operations.pop(); continue;}
                                                
                                }else{
                                        asstcodeFilter=inAsset.getCode();
                                        asstissuFilter=inAsset.getIssuer();
                                        sqlstr = "select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                                        values = [srcTrns,asstcodeFilter,asstissuFilter];
                                }
                                   const [resultq,fields] = await  this.SqlQ.execute(sqlstr,values );//,async (err,resultq)=>{
			               //console.log(`resultQuery-> ${err.length}`);
			               if (resultq.length){
					if ( !inAsset.isNative() ){
					  await this.amountDecimalControl(inamount,inAsset,this.StellarSdk,this.server, async (inresult)=>{
						  console.log("2decimal amount is ",inresult);
						  if ( inresult )
						        transferNotPermited = false;
						  else
						        {callback(false);transferNotPermited = true;}
						  element = operations.pop();
					  });
					 }
					}else{
						transferNotPermited = true;
						console.log('-->',transferNotPermited);
						callback(false);//return false;
					}

	         }else{
			 if ( !inAsset.isNative() ){
                                 await this.amountDecimalControl(inamount,inAsset,this.StellarSdk,this.server,(inresult)=>{
					 if( inresult )
					       transferNotPermited = false;
					 else
					     {callback(false);transferNotPermited = true;}
					    
					    element = operations.pop();
                                      });
                               }else
				 element = operations.pop();
		 }
                        }catch(e){
				console.log('----->>>',e);
		 		element = operations.pop();
                        }
			 if ( transferNotPermited )
				 break;
	        };
		if ( !transferNotPermited )
			callback(true);
		return true;
	}
}

module.exports = TransferAuthorize;
