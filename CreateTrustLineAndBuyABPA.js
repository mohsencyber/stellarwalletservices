
var StellarSdk = require('stellar-sdk');


var server = new StellarSdk.Server('https://hz1-test.kuknos.org') //Test Network

//const server = new StellarSdk.Server('http//srv1.tosan-kuknos.org/horizon/') //Live Network

var issuingKeys = StellarSdk.Keypair
  .fromSecret('SASEZLZBVWWRBWISRGJJZOIQYKJCTYOZNXAIEZYDSMALWBACEFLLNP6L');
var receivingKeys = StellarSdk.Keypair
  .fromSecret('SCOE3UNFCGYGKHWLLEG2KONSE7OYXHTWTTEGCQ6B2VYP5HH76S6PYOGI');

// Create an object to represent the new asset
var abpa = new StellarSdk.Asset('ABPA', issuingKeys.publicKey());

// First, the receiving account must trust the asset
server.loadAccount(receivingKeys.publicKey())
  .then(function(receiver) {
    var transaction = new StellarSdk.TransactionBuilder(receiver, {
      fee: 50000,
      networkPassphrase: 'Kuknos-NET'
    })
      // The `changeTrust` operation creates (or alters) a trustline
      // The `limit` parameter below is optional
      .addOperation(StellarSdk.Operation.changeTrust({
        asset: abpa ,
        limit: '1000000'
      }))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build();
    transaction.sign(receivingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function(error) {
    console.error('Error!', error);
  })

  // Second, the issuing account actually sends a payment using the asset
  .then(function() {
    return server.loadAccount(issuingKeys.publicKey())
  })
  .then(function(issuer) {
    var transaction = new StellarSdk.TransactionBuilder(issuer, {
      fee: 50000,
      networkPassphrase: 'Kuknos-NET'
    })
      .addOperation(StellarSdk.Operation.payment({
        destination: receivingKeys.publicKey(),
        asset: abpa,
        amount: '100'
      }))
      // setTimeout is required for a transaction
      .setTimeout(100)
      .build();
    transaction.sign(issuingKeys);
    return server.submitTransaction(transaction);
  })
  .then(console.log)
  .catch(function(error) {
    console.error('Error!', error);
  });
 
