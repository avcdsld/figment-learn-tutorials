const {
  EnigmaUtils, Secp256k1Pen, SigningCosmWasmClient, pubkeyToAddress, encodeSecp256k1Pubkey
} = require("secretjs");

const fs = require("fs");
require('dotenv').config();

const customFees = {
  upload: {
      amount: [{ amount: "2000000", denom: "uscrt" }],
      gas: "2000000",
  },
  init: {
      amount: [{ amount: "500000", denom: "uscrt" }],
      gas: "500000",
  },
  exec: {
      amount: [{ amount: "500000", denom: "uscrt" }],
      gas: "500000",
  },
  send: {
      amount: [{ amount: "80000", denom: "uscrt" }],
      gas: "80000",
  },
}

const main = async () => {
  const httpUrl = process.env.SECRET_REST_URL;
  const mnemonic = process.env.MNEMONIC;
  const signingPen = await Secp256k1Pen.fromMnemonic(mnemonic);
  const pubkey = encodeSecp256k1Pubkey(signingPen.pubkey);
  const accAddress = pubkeyToAddress(pubkey, 'secret');

  // 1. Initialize client
  const txEncryptionSeed = EnigmaUtils.GenerateNewSeed();
  const client = new SigningCosmWasmClient(
    httpUrl,
    accAddress,
    (signBytes) => signingPen.sign(signBytes),
    txEncryptionSeed, customFees
  );
  console.log('Wallet address: ', accAddress);

  // // 2. Upload the contract wasm
  // const wasm = fs.readFileSync("mysimplecounter/contract.wasm");
  // const uploadReceipt = await client.upload(wasm, {});
  // console.log('uploadReceipt: ', uploadReceipt); // test
  // console.log('uploadReceipt.codeId: ', uploadReceipt.codeId); // test
  const uploadReceipt = {codeId: 539};

  // let contractAddress;
  // for (let i = 0; i < 100; i++) {
  // try {
  //   // 3. Create an instance of the Counter contract
  //   const codeId = uploadReceipt.codeId;
  //   const initMsg = { "count" : 101};
  //   const contract = await client.instantiate(codeId, initMsg, "My Counter" + Math.ceil(Math.random()*10000));
  //   // const contractAddress = contract.contractAddress;
  //   contractAddress = contract.contractAddress;
  //   console.log('contract:', contract);
  //   console.log('contract.contractAddress:', contractAddress);
  //   break;
  // } catch (e) {
  //   console.log(e.message);
  //   continue;
  // }
  // }
  const contractAddress = 'secret1sg26nwym48493ukl23wu7nr4c946d4k09fl8hu'; // test

  // // 4. Query the counter
  // for (let i = 0; i < 100; i++) {
  //   try {
  //     let response = await client.queryContractSmart(contractAddress, { "get_count" : {}});
  //     console.log('Count: ', response.count);
  //     break;
  //   } catch (e) {
  //     console.log(e.message);
  //     continue;
  //   }
  // }

  // 5. Increment the counter
  for (let i = 0; i < 100; i++) {
    try {
      const handleMsg = { increment: {} };
      response = await client.execute(contractAddress, handleMsg);
      console.log('response: ', response);
      break;
    } catch (e) {
      console.log(e.message);
      continue;
    }
  }

  // Query again to confirm it worked
  console.log('Querying contract for updated count')
  response = await client.queryContractSmart(contractAddress, { "get_count": {}})

  console.log('New Count: ', response.count);
};

main();