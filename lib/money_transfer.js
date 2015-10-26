'use strict';

let Aggregate = require('./aggregate');
let util = require('util');

module.exports = MoneyTransfer;

function MoneyTransfer() {}

util.inherits(MoneyTransfer, Aggregate);

MoneyTransfer.findOrCreate = Aggregate.findOrCreate(MoneyTransfer);

MoneyTransfer.prototype.processCommand = function *(msg) {
  if (msg.cmd === 'create') {
    return yield this._save({
      event: 'moneyTransferCreated',
      from: msg.from,
      to: msg.to,
      amount: msg.amount,
      state: 'created'
    });
  } else if (msg.cmd === 'complete') {
    return yield this._save({
      event: 'moneyTransferCompleted',
      from: msg.from,
      to: msg.to,
      amount: msg.amount,
      state: 'completed'
    });
  }
};

MoneyTransfer.prototype._applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'moneyTransferCreated') {
      this.from = x.from;
      this.to = x.to;
      this.amount = x.amount;
      this.state = x.state;
    } else if (x.event === 'moneyTransferCompleted') {
      this.state = x.state;
    }
  }
};
