var inStellarSdk = require('stellar-sdk');

function  Assets(assetcode,assetissuer,id){
     this.assetCode = assetcode;
     this.assetIssuer = assetissuer;
     this.Id = id;
}

Assets.prototype.setAssetCode = function(assetcode){
	this.assetCode=assetcode;
}

Assets.prototype.setAssetIssuer = function(assetissuer){
	this.assetIssuer=assetissuer;
}

Assets.prototype.setAssetFromId = async function(SqlQ){
	if ( this.Id && !this.assetCode && !this.assetIssuer ){
		var sqlstr="select * from assets where id = ?";
		var values=[this.Id];
		await SqlQ.query(sqlstr,values,function(err,result){
			if ( err ) {console.log(err);}
			if ( result ){
				this.assetCode=result[0].assetcode;
				this.assetIssuer=result[0].assetissuer;
			}
		});

	}
}

Assets.prototype.getAssetObj = async function(SqlQ){
	await setAssetFromId(SqlQ);
	if ( this.assetCode && this.assetIssuer &&
	      this.assetCode.length>0 && this.assetIssuer.length>0 ){

		//console.log("is not Native");
		return new inStellarSdk.Asset(this.assetCode,this.assetIssuer);
	}else{
		//console.log("is Native");
		return new inStellarSdk.Asset.native();
	}
}

module.exports = Assets;

