const StellarSdk = require('stellar-sdk');

const kuknusKeyPair = StellarSdk.Keypair.random();

console.log("AccountID: " +kuknusKeyPair.publicKey());
console.log("AccountPrivateKey: " + kuknusKeyPair.secret()); 
