const {
  CosmWasmClient, Secp256k1Pen, pubkeyToAddress, encodeSecp256k1Pubkey, makeSignBytes
} = require("secretjs");

require('dotenv').config();

const main = async () => {

  // As in previous tutorial, initialise client from ENV
  const mnemonic = process.env.MNEMONIC;
  const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
  const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
  const accAddress = pubkeyToAddress(pubkey, 'secret');
  const client = new CosmWasmClient(process.env.SECRET_REST_URL);
  // const chainId = await client.getChainId();
  const chainId = 'holodeck-2'; // test


  // Optionally, define a memo for the transaction
  const memo = 'My first secret transaction, sending uscrt';

  // 1. Define TX message
  const sendMsg = {
    type: "cosmos-sdk/MsgSend",
    value: {
      from_address: accAddress,
      to_address: accAddress,
      amount: [
        {
          denom: "uscrt",
          amount: "1000000",
        },
      ],
    },
  };

  // 2. Define fees
  const fee = {
    amount: [
      {
        amount: "50000",
        denom: "uscrt",
      },
    ],
    gas: "100000",
  };

  // 3. Sign transaction
  // const { accountNumber, sequence } = await client.getNonce(accAddress);
  // console.log('accountNumber, sequence: ', accountNumber, sequence);
  const accountNumber = 1229; // test
  const sequence = 1; // test

  const signBytes = makeSignBytes([sendMsg], fee, chainId, memo, accountNumber, sequence);
  const signature = await signingPen.sign(signBytes);
  const signedTx = {
    msg: [sendMsg],
    fee: fee,
    memo: memo,
    signatures: [signature],
  };

  // 4. Broadcast TX
  const { logs, transactionHash } = await client.postTx(signedTx);

  console.log('logs: ', logs); // test
  console.log('transactionHash: ', transactionHash); // test

  // 5. Query TX by hash/ID
  const query = {id: transactionHash}
  const tx = await client.searchTx(query)
  console.log('Transaction: ', tx);
}

main().then(resp => {
  console.log(resp);
}).catch(err => {
  console.log(err);
})