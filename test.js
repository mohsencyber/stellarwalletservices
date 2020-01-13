const  IDChecker = require('./nationalcodechecker.js');
const conf=require('./config.js');
const smssender=require('./smssender.js');
const StellarSdk = require('stellar-sdk');
const BigNumber = require('bignumber.js');

global.SHAHKAR_USER='tech@kuknos.org';
global.SHAHKAR_PASS='Ci699!';
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


//var secKey = "123456789";
//var encKey = StellarSdk.Keypair.fromSecret('SCEF6DC4XVDSEQVUOZZMPMMBPLE7DKTLUBSYSRZH26RZKE6FJODYRFKG');
//var encData = encKey.sign(secKey).toString('base64');
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
