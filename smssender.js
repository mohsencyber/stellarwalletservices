const axios = require('axios');

class SmsSender{
	constructor(user,pass,patternid,fromnum,url){
		this.User=user;
		this.Pass=pass;
		this.PatternID=patternid;
		this.Fromnum=fromnum;
		this.Url=url;
		//console.log(user,pass,fromnum,url);
	}

	 sendSms(code,tonum,callback){
		//console.log(this.Url);
		 axios({
                  url: this.Url,

                  method: 'post', // default

                 data: {
			 op:"pattern",
			 user:this.User,
			 pass:this.Pass,
			 fromNum:this.Fromnum,
			 toNum:tonum,
			 patternCode:this.PatternID,
			 inputData:[{ "vcode":code }]
                   }

                })/*.then(response=>{
                        //console.log(response['isOwner']);
                        //console.log(response);
                        callback(response.data);
                });*/
		 callback("Ok");
	}
}

module.exports = SmsSender;
