const StellarSdk = require('stellar-sdk');

try {
const server = new StellarSdk.Server('https://hz1-test.kuknos.org') //Test Network
                                   // .catch(error => { console.log('caught', error.message); });
//const server = new StellarSdk.Server('http//srv1.tosan-kuknos.org/horizon/') //Live Network
const source = StellarSdk.Keypair.fromSecret('SASEZLZBVWWRBWISRGJJZOIQYKJCTYOZNXAIEZYDSMALWBACEFLLNP6L')
const destination = StellarSdk.Keypair.random();

console.log("AccountID: " +destination.publicKey());
console.log("PrivateKey: " + destination.secret());

server.accounts()
  .accountId(source.publicKey())
  .call()
  .then(({ sequence }) => {
    const account = new StellarSdk.Account(source.publicKey(), sequence)
    const transaction = new StellarSdk.TransactionBuilder(account, {
      fee: 50000,//StellarSdk.BASE_FEE,
      networkPassphrase: 'Kuknos-NET'
    })
      .addOperation(StellarSdk.Operation.createAccount({
        destination: destination.publicKey(),
        startingBalance: '25'
      }))
	  .setTimeout(100)
      .build();
	  console.log(transaction.toXDR());
    //transaction.sign(StellarSdk.Keypair.fromSecret(source.secret()))
    //return server.submitTransaction(transaction)
	  })
  //.then(results => {
  //  console.log('Transaction', results._links.transaction.href)
  //  console.log('New Keypair', destination.publicKey(), destination.secret())
  //})
  // .catch(error => { console.log('caught : ', error); });

}catch(error){
	console.log('Error =>',error.message);
}
