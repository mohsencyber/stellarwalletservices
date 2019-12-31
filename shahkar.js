
const axios = require('axios');

class Shahkar{
	constructor(user,pass,url){
		this.User=user;
		this.Pass=pass;
		this.Url=url;
		//console.log(this.User);
	}

	async isVerified(mobilenumber,nationalcode){

	var trreq = await axios({
		  url: 'https://esbapi.pec.ir/ApiManager/Vas/Shahkar',

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
		        console.log(response);
			if (response['isOwner']==true)
				return true;
			else
				return false;
		});		
		
	}

}

module.exports = Shahkar;
