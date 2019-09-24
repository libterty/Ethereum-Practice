const express = require('express');
const request = require('request');
const Account = require('../account');
const Blockchain = require('../blockchain');
const Block = require('../blockchain/block');
const PubSub = require('./pubsub');
const Transaction = require('../transactions');
const TransactionQueue = require('../transactions/transaction-queue');
const app = express();
const account = new Account();
const blockchain = new Blockchain();
const transaction = Transaction.createTransaction({ account });
const transactionQueue = new TransactionQueue();
const pubsub = new PubSub({ blockchain });
const port = process.argv.includes('--peer')
  ? Math.floor(2000 + Math.random() * 1000)
  : 3000;
const peer = process.argv.includes('--peer');
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

transactionQueue.add(transaction);

// console.log(
//     'transactionQueue.getTransactionSeries()',
//     transactionQueue.getTransactionSeries()
// );

app.get('/blockchain', (req, res, next) => {
  const { chain } = blockchain;

  res.json({ chain });
});

app.get('/blockchain/mine', (req, res, next) => {
  const lastBlock = blockchain.chain[blockchain.chain.length - 1];
  const block = Block.mineBlock({ lastBlock, beneficiary: account.address });

  // expect error return
  // block.blockHeaders.parentHash = 'foo'

  blockchain
    .addBlock({ block })
    .then(() => {
      pubsub.broadcastBlock(block);

      res.json({ block });
    })
    .catch(next);
});

app.use((err, req, res, next) => {
  console.error('Internal server err:', err);

  res.status(500).json({ message: err.message });
});

app.listen(port, () => {
  console.log(`listening at port: ${port}`);
});
