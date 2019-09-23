const { GENSIS_DATA } = require('../config');

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);

class Block {
  constructor({ blockHeaders }) {
    this.blockHeaders = blockHeaders;
  }

  static calculateBlockTargetHash({ lastBlock }) {
    // parseInt('f'.repeat(HASH_LENGTH), 16).toString(16).length // 65
    const value = (MAX_HASH_VALUE / lastBlock.blockHeaders.difficulty).toString(
      16
    );

    // Remain 64 length consistency, prevent large return
    if (value.length > HASH_LENGTH) {
      return 'f'.repeat(HASH_LENGTH);
    }

    // Remain 64 length consistency, prevent small return
    return '0'.repeat(HASH_LENGTH - value.length) + value;
  }

  static mineBlock({ lastBlock, beneficiary }) {}

  static genesis() {
    return new this(GENSIS_DATA); // this eq Block
  }
}

module.exports = Block;
