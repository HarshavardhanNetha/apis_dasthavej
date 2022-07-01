import { TimeoutInfinite } from 'stellar-sdk';

const StellarSDK = require('stellar-sdk');
const serverTest = new StellarSDK.Server('https://horizon-testnet.stellar.org'); 

export default async function createEvent(
    req,res
   ) {
     try {
       if(req.body.publicKey == undefined){
       res.status(400).json({ error: "PublicKey is required. Resource Error" });
   
       }
       const pubKey = req.body.publicKey
       const eventID = req.body.eventID
       const secret = req.body.secret
       let sequenceNum = req.body.sequenceNum
       var rootKeypair = StellarSDK.Keypair.fromSecret(secret)
      // var rootKeypair = StellarSDK.Keypair.fromPublicKey(pubKey)

       const seq = await serverTest.loadAccount(pubKey);
       console.log(seq.sequence);
       sequenceNum = sequenceNum - 1;
       let seqStr = sequenceNum.toString()

         let account =  new StellarSDK.Account(pubKey, seqStr);
        //  console.log(account);
         var transaction = new StellarSDK.TransactionBuilder(account, {
            fee: StellarSDK.BASE_FEE,
            networkPassphrase: StellarSDK.Networks.TESTNET 
          })
          .addOperation(StellarSDK.Operation.manageData({
            "name" : eventID,
            "value": "Approved"
          }))
          .setTimeout(TimeoutInfinite)
          .build();
        
        // transaction.sign(rootKeypair)
        console.log(transaction.toEnvelope().toXDR('base64'));
        res.status(200).json({"sequence":transaction["_sequence"], "xdr":transaction.toEnvelope().toXDR('base64'), "se.sequence":seq.sequence});

        // let op_resp = await serverTest.submitTransaction(transaction)
        
        // console.log(op_resp);
        // console.log(op_resp.extras);

    //    res.status(200).json(op_resp);
        }
       catch (error) {
       console.log(error);
       res.status(500).json({ error: error.message });
     }
   }
   