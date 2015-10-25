'use strict';

module.exports = MoneyTransfer;

function MoneyTransfer() {}

MoneyTransfer.prototype.processCommand = function *(msg) {
  if (msg.cmd === 'create') {
    return [{
      event: 'moneyTransferCreated',
      from: msg.from,
      to: msg.to,
      amount: msg.amount,
      state: 'created'
    }];
  } else if (msg.cmd === 'complete') {
    return [{
      event: 'moneyTransferCompleted',
      from: msg.from,
      to: msg.to,
      amount: msg.amount,
      state: 'completed'
    }];
  }
};

MoneyTransfer.prototype.applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'moneyTransferCreated') {
      this.from = x.from;
      this.to = x.to;
      this.amount = x.amount;
      this.state = x.state;
    } else if (x.event === 'moneyTransferCreated') {
      this.state = x.state;
    }
  }
};
