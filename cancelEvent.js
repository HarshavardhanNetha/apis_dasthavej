import { TimeoutInfinite } from 'stellar-sdk';

const StellarSDK = require('stellar-sdk');
const serverTest = new StellarSDK.Server('https://horizon-testnet.stellar.org'); 

export default async function cancelEvent(
    req,res
   ) {
     try {
      //  if(req.body.publicKey == undefined){
      //  res.status(400).json({ error: "PublicKey is required. Resource Error" });
   
      //  }
       const xdr = req.body.xdr
      //  const eventID = req.body.eventID
       const secret = req.body.secret
       var rootKeypair = StellarSDK.Keypair.fromSecret(secret)
       let pubKey = rootKeypair.publicKey()
      // var rootKeypair = StellarSDK.Keypair.fromPublicKey(pubKey)

       const seq = await serverTest.loadAccount(pubKey);
      //  console.log(seq.sequence);

         let account =  new StellarSDK.Account(pubKey, seq.sequence);
        //  console.log(account);
         var transaction = new StellarSDK.TransactionBuilder.fromXDR(xdr, StellarSDK.Networks.TESTNET)
        
         let sequenceNum = transaction["_sequence"];
        
         let new_seq = parseInt(sequenceNum) + 1;
         let new_seq_str = new_seq.toString()
        console.log(new_seq_str);
        console.log(typeof(new_seq_str));
          let cancelTransaction = new StellarSDK.TransactionBuilder(account, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: StellarSDK.Networks.TESTNET
          })
          .setTimeout(TimeoutInfinite)
          .addOperation(StellarSDK.Operation.bumpSequence({bumpTo: new_seq_str}))
          .build()
          
          cancelTransaction.sign(rootKeypair)
        let resp_xdr = cancelTransaction.toEnvelope().toXDR('base64');
        console.log(resp_xdr);

        let op_resp = await serverTest.submitTransaction(cancelTransaction)
        console.log(op_resp);
        // console.log(op_resp.extras);

          res.status(200).json({"xdr":op_resp});
        }
       catch (error) {
       console.log(error);
       res.status(500).json({ error: error.message });
     }
   }
   