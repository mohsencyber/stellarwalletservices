var inStellarSdk = require('stellar-sdk');

function  Assets(assetcode,assetissuer,id){
     this.assetCode = assetcode;
     this.assetIssuer = assetissuer;
     this.Id = id;
}

/*
Assets.prototype.setAssetCode = function(assetcode){
	this.assetCode=assetcode;
}

Assets.prototype.setAssetIssuer = function(assetissuer){
	this.assetIssuer=assetissuer;
}*/

Assets.prototype.setAssetFromId = async function(SqlQ,callback){
		console.log("setAssetFromId call.");
	if ( this.Id && !this.assetCode && !this.assetIssuer ){
		var sqlstr="select * from assets where id = ?";
		var values=[this.Id];
		//console.log("==> id is set.");
		await SqlQ.query(sqlstr,values,(err,result)=>{
			if ( err ) {console.log(err);}
			if ( result ){
				this.assetCode=result[0].assetcode;
				this.assetIssuer=result[0].assetissuer;
				//console.log(this.assetCode,this.assetIssuer);
				//console.log("===>",this.assetCode,this.assetIssuer);
				callback(true,this.assetCode,this.assetIssuer);
			}else
				callback(false);
		});

	}else{
		//console.log("==>Assetcode is set");
		//console.log("====>",this.assetCode,this.assetIssuer);
		callback(true,this.assetCode,this.assetIssuer);
	}
	//console.log("111111111111111");
	
}

Assets.prototype.getAssetObj = async function(SqlQ,callback){
		console.log("=>",this.assetCode,this.assetIssuer);
	await this.setAssetFromId(SqlQ,(result,assetcode,assetissuer)=>{
	if ( result ) {
		this.assetCode=assetcode;
		this.assetIssuer=assetissuer;
		console.log(this.assetCode,this.assetIssuer);
		if ( this.assetCode && this.assetIssuer &&
		      this.assetCode.length>0 && this.assetIssuer.length>0 ){

			console.log("is not Native");
			callback(new inStellarSdk.Asset(this.assetCode,this.assetIssuer));
		}else{
			console.log("is Native");
			callback(new inStellarSdk.Asset.native());
		}
            }
       });
}

module.exports = Assets;

