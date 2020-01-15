const  IDChecker = require('./nationalcodechecker.js');
const conf=require('./config.js');
const smssender=require('./smssender.js');
const StellarSdk = require('stellar-sdk');
const StellarBase = require('stellar-base');
const BigNumber = require('bignumber.js');

global.SHAHKAR_USER='tech@kuknos.org';
global.SHAHKAR_PASS='Ci699!';



//var req = "AAAAALGffQJHwfiDO4MARORtzLEjd+BGiJoeGCJ6781B9Fc5AADDUAAvwacAAAAKAAAAAAAAAAAAAAABAAAAAAAAAAEAAAAApJAsEzpn6mUgOn/2+9ca5c21QJvQU+Xt4t+klUJg5pEAAAABQUJQQQAAAABmn0UFtEAdOckntV81AGSBGJU+gvVfJf5y2GUutrfN3AAAAAAAxl1AAAAAAAAAAAA=";
var req = "AAAAAGafRQW0QB05ySe1XzUAZIEYlT6C9V8l/nLYZS62t83cAAJJ8AAro7kAAAAKAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAAAAAAAGAAAAAUFCUEEAAAAAZp9FBbRAHTnJJ7VfNQBkgRiVPoL1XyX+cthlLra3zdx//////////wAAAAAAAAAFAAAAAAAAAAAAAAAAAAAAAAAAAAEAAAABAAAAAQAAAAEAAAABAAAAAQAAAAAAAAAAAAAAAAAAAAEAAAAAZp9FBbRAHTnJJ7VfNQBkgRiVPoL1XyX+cthlLra3zdwAAAACQUJQQVJTAAAAAAAAAAAAAGafRQW0QB05ySe1XzUAZIEYlT6C9V8l/nLYZS62t83cAAAAAAIWDsAAAAAAAAAAAA==";
const transaction = new StellarBase.Transaction(req,conf.NetworkPass);
var amount = transaction.operations[0].amount;
var amount2 //= transaction.toEnvelope().tx().operations()[0].body().paymentOp().amount()
var oprs = transaction.operations;
oprs.forEach( element => {
	try{
		var  amount3 = element.amount.toString();
		var crcamnt= parseFloat(amount3)*Math.pow(10,1);
		if ( crcamnt - parseInt(crcamnt) == 0)
			console.log(amount3);
		else 
			console.log(`invalid ${amount3}`)
	}catch(err) {

	};
	
});
console.log(amount,amount2);
/*
idChecker = new IDChecker(1,'0068812991','14005083301','09352492937');
console.log('1===>');
//async function ttt(){
console.log('2===>');
 idChecker.isVerified(res=>{
	 */
/*console.log("--->",idChecker.personality,
	    idChecker.corpID ,//idChecker.idChecker.nationalID,
	    idChecker.mobileNumber,
	    idChecker.nationalCode);*/
/*
console.log('3===>'+res);
if (res){
	console.log('verified. :)');
}else{
	console.log('Not verified. :(');
}
//});
//}
//ttt().then(result =>{;

console.log('4===>');
console.log(idChecker.personality,
	    idChecker.corpID,
	    idChecker.mobileNumber,
	    idChecker.nationalCode);
console.log("What???!!!");
});
*/
/*
Public Key
        GC7F64CBBEOZGMYNH4W7K24UZK7ILHSOX57T6IHOZP76S32KB5R6VNTM
   Secret Key
        SCEF6DC4XVDSEQVUOZZMPMMBPLE7DKTLUBSYSRZH26RZKE6FJODYRFKG
 */
var xxx//="123";
var xx=0;
if ( xxx )
	xx=parseInt(xxx);
console.log(10+xx);

var y = null;
 if ( y )
	console.log(`go ${y}`);
var secKey = "GCYZ67ICI7A7RAZ3QMAEJZDNZSYSG57AI2EJUHQYEJ5O7TKB6RLTSYHP,1.5,1,1234567891";
var encKey = StellarSdk.Keypair.fromSecret('SDD5T25GGNXDCOAVT4ZFCSPUZ4WMXZRKVZFJ7MTRSGOSWFHBDO4LQ6IH');//'SCEF6DC4XVDSEQVUOZZMPMMBPLE7DKTLUBSYSRZH26RZKE6FJODYRFKG');
console.log(encKey.publicKey());
var encData = encKey.sign(secKey).toString('base64');
console.log(encData);
//var verifyKey=StellarSdk.Keypair.fromPublicKey('GC7F64CBBEOZGMYNH4W7K24UZK7ILHSOX57T6IHOZP76S32KB5R6VNTM');
//if ( verifyKey.verify("123456789",Buffer.from(encData,'base64')) ){
//	console.log(encData.toString('base64'));
//	console.log("==>Data Verified.");
//}else 
//	console.log("==>Data Not Verified.");
//console.log(conf.SmsUrl);
//var smsSender=new smssender(conf.SmsUser,conf.SmsPass,conf.SmsPatternId,conf.SmsNumber,conf.SmsUrl);

//smsSender.sendSms("2554","09121872491",function(res){
//	console.log(res);
//       });

try{
var memotype=  StellarSdk.MemoNone;
var memoO = '1231110000';
var memo = new StellarSdk.Memo(memotype,memoO);

	var x= (new BigNumber(memoO)).sub(1);
	console.log(`sequence (${memoO}).sub(1) is ${x}`);

console.log(memo.toXDRObject('base64'));
	throw "rollback";
}catch(err){
	if (err=="Rollback")
		console.log("[ERROR]",err);
	console.log(err);
}
