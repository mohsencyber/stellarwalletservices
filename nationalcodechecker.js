class NationalCodeChecker{
	constructor(personality,nationalcode,nationalid,mobilenumber){
		//console.log(personality,nationalid);
		if ( personality==0 && nationalid && nationalid.length > 10   ) {
			this.personality = 0;//legal person
			this.idChecker = new  NationalIDCheck   (this.personality,nationalcode,nationalid,mobilenumber);
		}else{
			this.personality = 1;//a real person
			this.idChecker = new  NationalCodeCheck (this.personality,nationalcode,nationalid,mobilenumber);
		}
	}
       isValid(){
	       return  this.idChecker.isValid();
       }
       async isVerified(){
	       return  await this.idChecker.isVerified();
       }
       get corpID () {
	       return this.idChecker.nationalID;
       }
	get mobileNumber () {
		return  this.idChecker.mobileNumber;
	}
	get nationalCode () {
		return this.idChecker.nationalCode;
	}
	get  personality () {
		return this._personality;
	}
	set personality (x) {
		this._personality=x;
	}
}

class CheckerBase{
	constructor(personality,nationalcode,nationalid,mobilenumber){
		this.personality=personality;
                this.nationalCode=nationalcode;
                this.nationalID=nationalid;
                this.mobileNumber=mobilenumber;
	}
}

class NationalIDCheck extends CheckerBase {
	 
	constructor(personality,nationalcode,nationalid,mobilenumber){
		super(personality,nationalcode,nationalid,mobilenumber);
		//this.personality=personality;
		//this.personality=personality;
	}

	isValid(){
		//console.log(this.nationalID);
		if ( !this.nationalID )
			return false;
		var L=this.nationalID.length;
  
  		if(L<11 || parseInt(this.nationalID,10)==0) 
			return false;
  		if(parseInt(this.nationalID.substr(3,6),10)==0) 
			return false;
  		var c=parseInt(this.nationalID.substr(10,1),10);
  		var d=parseInt(this.nationalID.substr(9,1),10)+2;
  		var z=new Array(29,27,23,19,17);
  		var s=0;
  		for(var i=0;i<10;i++)
    			s+=(d+parseInt(this.nationalID.substr(i,1),10))*z[i%5];
  		s=s%11;if(s==10) s=0;
  		return (c==s);		
	}

	 isVerified(){
		//console.log("nationalID verifier.");
		if ( this.isValid() ) {
			//check NationalID with NationalCode of CEO
			return true;
		}else 
			return false;
	}
}

class NationalCodeCheck extends CheckerBase {
	 
	constructor(personality,nationalcode,nationalid,mobilenumber){
		super(personality,nationalcode,nationalid,mobilenumber);
		//this.personality=personality;
	}

	isValid(){
		//console.log(this.nationalCode);
		//for ( var j=0;j<10000000;j++);
		if ( !this.nationalCode ) 
			return false;
		var L=this.nationalCode.length;
  
		if(L<8 || parseInt(this.nationalCode,10)==0) 
			return false;
  		this.nationalCode=('0000'+this.nationalCode).substr(L+4-10);
  		if(parseInt(this.nationalCode.substr(3,6),10)==0) 
			return false;
  		var c=parseInt(this.nationalCode.substr(9,1),10);
  		var s=0;
  		for(var i=0;i<9;i++)
    		s+=parseInt(this.nationalCode.substr(i,1),10)*(10-i);
  		s=s%11;
  		return (s<2 && c==s) || (s>=2 && c==(11-s));		
	}

	 isVerified(){
		//console.log("nationalCode verifier.");
		if ( this.isValid() ) {
			//check shahkar service for verify nationalcode+mobilenumber
			if ( !this.mobileNumber ) 
				return false;
			return true;
		}else
			return  false;
	}
}

module.exports = NationalCodeChecker;
