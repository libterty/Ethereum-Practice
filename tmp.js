const Trie = require('./store/trie');
const { keccakHash } = require('./util');
const _ = require('lodash');

const trie = new Trie();
const accountData = { balance: 1000 };
const transaction = { data: accountData };
trie.put({ key: 'foo', value: transaction });
const retrievedTransaction = trie.get({ key: 'foo' });
const hash1 = keccakHash(retrievedTransaction);
console.log('hash1', hash1);

accountData.balance += 50;

const hash2 = keccakHash(retrievedTransaction);
console.log('hash2', hash2);

// to always return a complete of object instead of reference of object
// hash1 4c47acfe65d97a98018eb5ebde5276fab1e6c3418cfed38a1311a3eb4b5409c2
// hash2 13dcaf871555347afe76c28260dec35c689589c9e9e8ea6469539b618bc51d6c
