const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const Account = require('../account');
const Blockchain = require('../blockchain');
const Block = require('../blockchain/block');
const PubSub = require('./pubsub');
const State = require('../store/state');
const Transaction = require('../transactions');
const TransactionQueue = require('../transactions/transaction-queue');
const account = new Account();
const state = new State();
const blockchain = new Blockchain({ state });
const transaction = Transaction.createTransaction({ account });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub({ blockchain, transactionQueue });
const peer = process.argv.includes('--peer');
const app = express();
app.use(bodyParser.json());
const port = peer ? Math.floor(2000 + Math.random() * 1000) : 3000;

if (peer) {
  request('http://localhost:3000/blockchain', (error, response, body) => {
    const { chain } = JSON.parse(body);

    // console.log('chain', chain);
    blockchain
      .replaceChain({ chain })
      .then(() => console.log('Sync blockchain with the root code'))
      .catch(err => console.error('Sync error:', err.message));
  });
}

setTimeout(() => {
  pubsub.broadcastTransaction(transaction);
}, 500);

app.get('/blockchain', (req, res, next) => {
  const { chain } = blockchain;

  res.json({ chain });
});

app.get('/blockchain/mine', (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const block = Block.mineBlock({
    lastBlock,
    beneficiary: account.address,
    transactionSeries: transactionQueue.getTransactionSeries(),
    stateRoot: state.getStateRoot()
  });

  // expect error return
  // block.blockHeaders.parentHash = 'foo'

  blockchain
    .addBlock({ block, transactionQueue })
    .then(() => {
      pubsub.broadcastBlock(block);

      res.json({ block });
    })
    .catch(next);
});

app.post('/account/transact', (req, res, next) => {
  const { code, gasLimit, to, value } = req.body;
  const transaction = Transaction.createTransaction({
    account: !to ? new Account({ code }) : account,
    gasLimit,
    to,
    value
  });
  pubsub.broadcastTransaction(transaction);
  res.json({ transaction });
});

app.get('/account/balance', (req, res, next) => {
  const { address } = req.query;

  const balance = Account.calculateBalance({
    address: address || account.address,
    state
  });

  res.json({ balance });
});

app.use((err, req, res, next) => {
  console.error('Internal server err:', err);

  res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`listening at port: ${port}`);
});
