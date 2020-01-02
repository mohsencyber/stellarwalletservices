const  IDChecker = require('./nationalcodechecker.js');
global.SHAHKAR_USER='tech@kuknos.org';
global.SHAHKAR_PASS='Ci699!';
idChecker = new IDChecker(1,'0068812991','14005083301','09352492937');
console.log('1===>');
//async function ttt(){
console.log('2===>');
 idChecker.isVerified(res=>{
/*console.log("--->",idChecker.personality,
	    idChecker.corpID ,//idChecker.idChecker.nationalID,
	    idChecker.mobileNumber,
	    idChecker.nationalCode);*/

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
