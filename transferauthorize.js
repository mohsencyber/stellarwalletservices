
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
		return true;
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
                callback( true) ;//res.status(403).end("Transaction not permitted");
	}
}

module.exports = TransferAuthorize;
