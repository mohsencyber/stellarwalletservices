var inStellarSdk = require('stellar-sdk');

function  Assets(assetcode,assetissuer,id){
     this.assetCode = assetcode;
     this.assetIssuer = assetissuer;
     if (assetcode=="PMN");
	{this.assetCode = null;
	 this.assetIssuer = null;}
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
		console.log("setAssetFromId call.",this.assetCode ,this.assetIssuer);
	if ( this.Id && !this.assetCode && !this.assetIssuer ){
		var sqlstr="select * from assets where id = ?";
		var values=[this.Id];
		//console.log("==> id is set.");
		await SqlQ.query(sqlstr,values,(err,result)=>{
			if ( err ) {console.log(err);}
			if ( result.length ){
				this.assetCode=result[0].assetcode;
				this.assetIssuer=result[0].assetissuer;
				this.truster=result[0].truster;
				//console.log(this.assetCode,this.assetIssuer);
				//console.log("===>",this.assetCode,this.assetIssuer);
				callback(true,this.assetCode,this.assetIssuer,this.truster);
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

Assets.prototype.getAssetTruster = async function( SqlQ , callback ){
	console.log("getAssetTruster");
	await this.setAssetFromId(SqlQ, async (result,assetcode,assetissuer,truster)=>{
		console.log(`getAssetsfromid:${result}-${truster}-${assetcode}:${assetissuer}`);
	if ( result ) {
		if( !assetcode && !assetissuer )
			callback("PMN");
		else if (!truster ) {
		    var sqlstr="select * from assets where assetcode = ? and assetissuer = ?";
        	        var values=[this.assetCode,this.assetIssuer];
	                await SqlQ.query( sqlstr ,values ,(err,result)=>{
	                        if ( err) callback(null);
	                        if ( result.length ){
	                                this.truster=result[0].truster;
	                                callback(this.truster);
	                       }else
	                               callback(null);
	               });
		    }else{
			    callback(truster);
		    }
	}else
		callback(null);
	});
}

Assets.prototype.getAssetObj = async function(SqlQ,callback){
		console.log("getAssetObj call",this.assetCode,this.assetIssuer);
	await this.setAssetFromId(SqlQ,(result,assetcode,assetissuer,truster)=>{
	if ( result ) {
		this.assetCode=assetcode;
		this.assetIssuer=assetissuer;
		this.truster=truster;
		console.log(` Asset is ${this.assetCode},${this.assetIssuer}`);
		if ( this.assetCode && this.assetIssuer &&
		      this.assetCode.length>0 && this.assetIssuer.length>0 ){

			console.log("is not Native");
			callback(new inStellarSdk.Asset(this.assetCode,this.assetIssuer),truster);
		}else{
			console.log("is Native");
			callback(new inStellarSdk.Asset.native());
		}
            }
       });
}


module.exports = Assets;

