const conf = require("./config.js");
const StellarSdk = require("stellar-sdk");

function KuknosID(accountstr){
	this.accountID=accountstr;
	if ( accountstr && 
		accountstr.indexOf("*")>0 ) {
		this.validID=false;
	}else{
		this.validID = true;
	}
}

KuknosID.prototype.getAccountID = async function(SqlConn,callback) {
	if ( !this.validID )
	{
		console.log("1 "+this.accountID);
		var sqlstr="select  id,concat(username,'*',domain) username ,domain,mobilenumber,email,nationalcode,fullname,personality,corpid from users where username=? and domain=?";		
		var values=this.accountID.split("*");
		//console.log(values,conf.HomeDomain);
		if ( values[1]==conf.HomeDomain ){
		await SqlConn.query(sqlstr,values,function(err,result){
			if (err) console.log(err);
			if (result.length ){
				this.validID=true;
				this.accountID=result[0].id;
				this.results=result[0];
				console.log("2 ConvertID = ",this.results);
				callback(this.accountID,this.results);
			}else{
				callback();
			}
		});
		}else {
			//console.log("getdata from federation");
			await StellarSdk.FederationServer.createForDomain(values[1])
				.then(federationServer=>{
					 federationServer.resolveAddress(this.accountID).then(federationRecord => {
						this.accountID = federationRecord.id;
						console.log(federationRecord);
						callback(this.accountID,federationRecord);
					}).catch(error=>{
						console.log(error.message);
						callback();
					});
				}).catch(error=>{
					console.log(error.message);
					callback();
				});
			//callback();
		}
	}else {
	   callback( this.accountID) ; 
	}
}

KuknosID.prototype.isValid = function() {
	return  this.validID;
}

module.exports =  KuknosID;
