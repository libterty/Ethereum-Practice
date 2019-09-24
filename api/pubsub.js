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
  constructor() {
    this.pubnub = new PubNub(credentials);
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
        console.log('messageObject', messageObject);
      }
    });
  }
}

module.exports = PubSub;

const pubsub = new PubSub();

setTimeout(() => {
  pubsub.publish({
    channel: CHANNELS_MAP.TEST,
    message: 'foo'
  });
}, 3000);
