const StellarSdk = require('stellar-sdk');

const publicKey='GDKHHHLBBCAEUD54ZBGXNFSXBR37EUHJCKGXOFTJLXXLIA75TNK533SI';
const  server = new StellarSdk.Server('https://hz1-test.kuknos.org');

//results = 
	server.accounts()
	.accountId(publicKey) //StellarSdk.Keypair.fromPublicKey(publicKey))
		.call()
		.then(function(results) {
			console.log("accountInfo : ",results.sequence)
			console.log("accountBalance : ",results.balances)
		});

		//console.log("account Info : " , results);
