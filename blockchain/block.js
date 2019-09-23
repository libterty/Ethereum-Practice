const { GENSIS_DATA } = require('../config');

class Block {
  constructor({ blockHeaders }) {
    this.blockHeaders = blockHeaders;
  }

  static mineBlock({ lastBlock }) {}

  static genesis() {
    return new this(GENSIS_DATA); // this eq Block
  }
}

module.exports = Block;
