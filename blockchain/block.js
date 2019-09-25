const { GENSIS_DATA, MINE_RATE } = require('../config');
const { keccakHash } = require('../util');
const Transaction = require('../transactions');
const Trie = require('../store/trie');

const HASH_LENGTH = 64;
const MAX_HASH_VALUE = parseInt('f'.repeat(HASH_LENGTH), 16);
const MAX_NONCE_VALUE = 2 ** 64;

class Block {
  constructor({ blockHeaders, transactionSeries }) {
    this.blockHeaders = blockHeaders;
    this.transactionSeries = transactionSeries;
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

  static adjustDifficulty({ lastBlock, timestamp }) {
    const { difficulty } = lastBlock.blockHeaders;

    if (timestamp - lastBlock.blockHeaders.timestamp > MINE_RATE) {
      return difficulty - 1;
    }

    if (difficulty < 1) {
      return 1;
    }

    return difficulty + 1;
  }

  static mineBlock({ lastBlock, beneficiary, transactionSeries, stateRoot }) {
    // temp header & nonce value will calculate actual hash that tries to meet the difficulty requirement.
    // if the hash found by combining header and nonce val falls under target than the block is valid, then create base on truncatedBlockHeaders.
    const target = Block.calculateBlockTargetHash({ lastBlock });
    const miningRewardTransaction = Transaction.createTransaction({
      beneficiary
    });
    transactionSeries.push(miningRewardTransaction);
    const transactionsTrie = Trie.buildTrie({ items: transactionSeries });
    let timestamp, truncatedBlockHeaders, header, nonce, underTargetHash;

    do {
      timestamp = Date.now();
      truncatedBlockHeaders = {
        parentHash: keccakHash(lastBlock.blockHeaders),
        beneficiary,
        difficulty: Block.adjustDifficulty({ lastBlock, timestamp }),
        number: lastBlock.blockHeaders.number + 1,
        timestamp,
        transactionRoot: transactionsTrie.rootHash,
        stateRoot
      };
      header = keccakHash(truncatedBlockHeaders);
      nonce = Math.floor(Math.random() * MAX_NONCE_VALUE);

      underTargetHash = keccakHash(header + nonce);
    } while (underTargetHash > target);

    // console.log('underTargetHash', underTargetHash);
    // console.log('target', target);

    // this eq Block
    return new this({
      blockHeaders: {
        ...truncatedBlockHeaders,
        nonce
      },
      transactionSeries
    });
  }

  static genesis() {
    return new this(GENSIS_DATA); // this eq Block
  }

  static validateBlock({ lastBlock, block, state }) {
    return new Promise((resolve, reject) => {
      if (keccakHash(block) === keccakHash(Block.genesis())) {
        return resolve();
      }

      if (
        keccakHash(lastBlock.blockHeaders) !== block.blockHeaders.parentHash
      ) {
        return reject(
          new Error("The parent hash must be a hash of the last block's header")
        );
      }

      if (block.blockHeaders.number !== lastBlock.blockHeaders.number + 1) {
        return reject(new Error('The block mush increment the number by 1'));
      }

      if (
        Math.abs(
          lastBlock.blockHeaders.difficulty - block.blockHeaders.difficulty
        ) > 1
      ) {
        return reject(new Error('The difficulty must only adjust by 1'));
      }

      const rebuiltTransactionsTrie = Trie.buildTrie({
        items: block.transactionSeries
      });

      if (
        rebuiltTransactionsTrie.rootHash !== block.blockHeaders.transactionRoot
      ) {
        return reject(
          new Error(
            `The rebuild transactions root does not match the block's` +
              `transactions root: ${block.blockHeaders.transactionRoot}`
          )
        );
      }

      const target = Block.calculateBlockTargetHash({ lastBlock });
      const { blockHeaders } = block;
      const { nonce } = blockHeaders;
      const truncatedBlockHeaders = { ...blockHeaders };
      delete truncatedBlockHeaders.nonce;
      const header = keccakHash(truncatedBlockHeaders);
      const underTargetHash = keccakHash(header + nonce);

      if (underTargetHash > target) {
        return reject(
          new Error('The block does not meet the proof of work requirement')
        );
      }

      Transaction.validateTransactionSeries({
        state,
        transactionSeries: block.transactionSeries
      })
        .then(resolve)
        .catch(reject);

      return resolve();
    });
  }

  static runBlock({ block, state }) {
    for (let transaction of block.transactionSeries) {
      Transaction.runTransaction({ transaction, state });
    }
  }
}

module.exports = Block;

// const block = Block.mineBlock({
//   lastBlock: Block.genesis(),
//   beneficiary: 'foo'
// });
// console.log('block', block);
