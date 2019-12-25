var inStellarSdk = require('stellar-sdk');

function  Assets(assetcode,assetissuer){
     this.assetCode = assetcode;
     this.assetIssuer = assetissuer;
}

Assets.prototype.setAssetCode = function(assetcode){
	this.assetCode=assetcode;
}

Assets.prototype.setAssetIssuer = function(assetissuer){
	this.assetIssuer=assetissuer;
}

Assets.prototype.getAssetObj = function(){
	if ( this.assetCode.length>0 && this.assetIssuer.length>0 ){

		//console.log("is not Native");
		return new inStellarSdk.Asset(this.assetCode,this.assetIssuer);
	}else{
		//console.log("is Native");
		return new inStellarSdk.Asset.native();
	}
}

module.exports = Assets;

