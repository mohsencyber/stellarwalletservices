
class TransferAuthorize{
	constructor ( sqlq, stellarsdk ,conf){
		this.SqlQ=sqlq;
		this.StellarSdk=stellarsdk;
		this.conff=conf
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
        async isAssetPermitted(srcTrns,asset,callback){
		var permitted= true;
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
	}

	async isOperationPermitted(srcTrns,operations, callback){
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
                                if (this.StellarSdk.Asset.fromOperation(element.body().paymentOp().asset()).isNative()){
                                        if ( this.conff.NativeControl ){
                                                sqlstr = "select * from validsource a where a.accountid=? and a.assetid is null";
                                                values = [srcTrns];
                                        }else
                                                return;
                                }else{
                                        asstcodeFilter=this.StellarSdk.Asset.fromOperation(element.body().paymentOp().asset()).getCode();
                                        asstissuFilter=this.StellarSdk.Asset.fromOperation(element.body().paymentOp().asset()).getIssuer();
                                        sqlstr = "select * from validsource a left join assets b on a.assetid=b.id where a.accountid=? and b.assetcode = ? and b.assetissuer = ? ";
                                        values = [srcTrns,asstcodeFilter,asstissuFilter];
                                }
                                await this.SqlQ.query(sqlstr,values,function(err,result){
                                        if (err) return console.log(err);
                                        if (!result.length )
                                                transferNotPermited = true;
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
