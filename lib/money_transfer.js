'use strict';

let Aggregate = require('./aggregate');
let util = require('util');

module.exports = MoneyTransfer;

function MoneyTransfer() {}

util.inherits(MoneyTransfer, Aggregate);

MoneyTransfer.findOrCreate = Aggregate.findOrCreate(MoneyTransfer);

MoneyTransfer.prototype.processCommand = function *(msg) {
  // create
  if (msg.cmd === 'create') {
    return yield this._save({
      event: 'moneyTransferCreated',
      from: msg.from,
      to: msg.to,
      amount: msg.amount,
      state: 'created'
    });
  // update
  } else if (this.guid) {
    if (msg.cmd === 'debite' && this.state === 'created') {
      return yield this._save({
        event: 'moneyTransferDebited',
        from: msg.from,
        to: msg.to,
        amount: msg.amount,
        state: 'debited'
      });
    } else if (msg.cmd === 'complete' && this.state === 'debited') {
      return yield this._save({
        event: 'moneyTransferCompleted',
        from: msg.from,
        to: msg.to,
        amount: msg.amount,
        state: 'completed'
      });
    }
  }
  throw new Error(`Command ${ msg.cmd } has not been implemented.`);
};

MoneyTransfer.prototype._applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'moneyTransferCreated') {
      this.from = x.from;
      this.to = x.to;
      this.amount = x.amount;
      this.state = x.state;
    } else {
      this.state = x.state;
    }
  }
};
