const  IDChecker = require('./nationalcodechecker.js');

idChecker = new IDChecker(null,'0068812991','1400508330','09121872491');

idChecker.isVerified().then(res=>{
/*console.log("--->",idChecker.personality,
	    idChecker.corpID ,//idChecker.idChecker.nationalID,
	    idChecker.mobileNumber,
	    idChecker.nationalCode);*/

if (res){
	console.log('verified. :)');
}else{
	console.log('Not verified. :(');
}
});


console.log(idChecker.personality,
	    idChecker.corpID,
	    idChecker.mobileNumber,
	    idChecker.nationalCode);
console.log("What???!!!");
