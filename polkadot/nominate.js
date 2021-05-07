const { ApiPromise, Keyring } = require('@polkadot/api');
const { HttpProvider } = require('@polkadot/rpc-provider');
require("dotenv").config();

const main = async () => {
  const httpProvider = new HttpProvider(process.env.DATAHUB_URL);
  const api = await ApiPromise.create({ provider: httpProvider });
  const keyring = new Keyring({type: 'sr25519'});

  // Initialize account from the mnemonic
  const proxyAccount = keyring.addFromUri(process.env.PROXY_MNEMONIC);

  // Nominate validators
  // The list of validators can be found here
  // https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/staking
  // We picked one but feel free to pick different ones
  const validator1 = '5FZoQhgUCmqBxnkHX7jCqThScS2xQWiwiF61msg63CFL3Y8f';
  const validator2 = '5G1ojzh47Yt8KoYhuAjXpHcazvsoCXe3G8LZchKDvumozJJJ';

  txHash = await api.tx.staking
    .nominate([validator1, validator2])
    .signAndSend(proxyAccount);

console.log(`View .nominate() tx: https://westend.subscan.io/extrinsic/${txHash}`);
};

main().catch((err) => {
  console.error(err);
}).finally(() => process.exit());
