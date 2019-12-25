
function KuknosID(accountstr){
	this.accountID=accountstr;
	if ( accountstr.indexOf("*")>0 ) {
		this.validID=false;
	}else{
		this.validID = true;
	}
}

KuknosID.prototype.getAccountID = async function(SqlConn,callback) {
	if ( !this.validID )
	{
		console.log("1 "+this.accountID);
		var sqlstr="select * from users where username=? and domain=?";		
		var values=this.accountID.split("*");
		await SqlConn.query(sqlstr,values,function(err,result){
			if (err) console.log(err);
			if (result.length ){
				this.validID=true;
				this.accountID=result[0].id;
				console.log("2 ConvertID = ",this.accountID);
				callback(this.accountID);
			}else{
				callback();
			}
		});

	}else {
	   callback( this.accountID) ; 
	}
}

KuknosID.prototype.isValid = function() {
	return  this.validID;
}

module.exports =  KuknosID;
