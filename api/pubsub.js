const PubNub = require('pubnub');
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
  BLOCK: 'BLOCK'
};

class PubSub {
  constructor({ blockchain }) {
    this.pubnub = new PubNub(credentials);
    this.blockchain = blockchain;
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
              .addBlock({ block: parsedMessage })
              .then(() => console.log('New block accepted'))
              .catch(err => console.error('New block rejected:', err.message));
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
}

module.exports = PubSub;

// const pubsub = new PubSub();
// setTimeout(() => {
//     pubsub.publish({
//         channel: CHANNELS_MAP.TEST,
//         message: 'foo'
//     });
// }, 3000);
