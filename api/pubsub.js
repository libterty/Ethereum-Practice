const PubNub = require('pubnub');
const Transaction = require('../transactions');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const credentials = {
  publishKey: process.env.PUBLISH_KEY,
  subscribeKey: process.env.SUBSCRIBE_KEY,
  secretKey: process.env.SECRET_KEY
};

const CHANNELS_MAP = {
  TEST: 'TEST',
  BLOCK: 'BLOCK',
  TRANSACTION: 'TRANSACTION'
};

class PubSub {
  constructor({ blockchain, transactionQueue }) {
    this.pubnub = new PubNub(credentials);
    this.blockchain = blockchain;
    this.transactionQueue = transactionQueue;
    this.subscriveToChannels();
    this.listen();
  }

  subscriveToChannels() {
    this.pubnub.subscribe({
      channels: Object.values(CHANNELS_MAP)
    });
  }

  publish({ channel, message }) {
    this.pubnub.publish({ channel, message });
  }

  listen() {
    this.pubnub.addListener({
      message: messageObject => {
        const { channel, message } = messageObject;
        const parsedMessage = JSON.parse(message);

        console.log('Message received. Channel:', channel);

        switch (channel) {
          case CHANNELS_MAP.BLOCK:
            console.log('block message', message);
            this.blockchain
              .addBlock({
                block: parsedMessage,
                transactionQueue: this.transactionQueue
              })
              .then(() => console.log('New block accepted', parsedMessage))
              .catch(err => console.error('New block rejected:', err.message));
            break;
          case CHANNELS_MAP.TRANSACTION:
            console.log(`Received transaction: ${parsedMessage.id}`);

            this.transactionQueue.add(new Transaction(parsedMessage));

            // console.log(
            //   'this.transactionQueue.getTransactionSeries()',
            //   this.transactionQueue.getTransactionSeries()
            // );

            break;
          default:
            return;
        }
      }
    });
  }

  broadcastBlock(block) {
    this.publish({
      channel: CHANNELS_MAP.BLOCK,
      message: JSON.stringify(block)
    });
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS_MAP.TRANSACTION,
      message: JSON.stringify(transaction)
    });
  }
}

module.exports = PubSub;

// const pubsub = new PubSub();
// setTimeout(() => {
//     pubsub.publish({
//         channel: CHANNELS_MAP.TEST,
//         message: 'foo'
//     });
// }, 3000);
