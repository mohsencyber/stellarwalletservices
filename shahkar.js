
const axios = require('axios');

class Shahkar{
	constructor(user,pass,url){
		this.User=user;
		this.Pass=pass;
		this.Url=url;
		//console.log(this.User);
	}

	async isVerified(mobilenumber,nationalcode,callback){

	var trreq = await axios({
		  url: this.Url, 

		method: 'post', // default

		 data: {
		          requestId: 12345,
		          mobileNumber: mobilenumber,
		          nationalCode: nationalcode
		  },

		  auth: {
		    username: this.User,
		    password: this.Pass
		  }

		}).then(response=>{
		        //console.log(response['isOwner']);
		        //console.log(response.data.isOwner);
		        callback(response.data.isOwner);
		});		
		
	}

}

module.exports = Shahkar;
