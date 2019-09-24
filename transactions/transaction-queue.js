class TransactionQueue {
  constructor(params) {
    this.transactionMap = {};
  }

  add(transaction) {
    this.transactionMap[transaction.id] = transaction;
  }

  getTransactionSeries() {
    return Object.values(this.transactionMap);
  }

  clearBlockTransactions({ transactionSeries }) {
    for (let transaction of transactionSeries) {
      delete this.transactionMap[transaction.id];
    }
  }
}

module.exports = TransactionQueue;
