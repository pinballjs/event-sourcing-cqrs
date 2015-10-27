'use strict';

let Aggregate = require('./aggregate');
let util = require('util');

module.exports = Account;

function Account() {
}

util.inherits(Account, Aggregate);

Account.findOrCreate = Aggregate.findOrCreate(Account);

Account.prototype.processCommand = function *(msg) {
  // create
  if (msg.cmd === 'open') {
    return yield this._save({
      event: 'accountOpened',
      initialBalance: msg.initialBalance
    });
  // update
  } else if (this.guid) {
    if (msg.cmd === 'credit') {
      return yield this._save({
        event: 'accountCredited',
        amount: msg.amount
      });
    } else if (msg.cmd === 'debit') {
      return yield this._save({
        event: 'accountDebited',
        amount: msg.amount
      });
    } else if (msg.cmd === 'debitBecauseOfMoneyTransfer') {
      return yield this._save({
        event: 'accountDebitedBecauseOfMoneyTransfer',
        transaction: msg.transaction,
        amount: msg.amount,
        from: msg.from,
        to: msg.to
      });
    } else if (msg.cmd === 'creditBecauseOfMoneyTransfer') {
      return yield this._save({
        event: 'accountCreditedBecauseOfMoneyTransfer',
        transaction: msg.transaction,
        amount: msg.amount,
        from: msg.from,
        to: msg.to
      });
    }
  }
  throw new Error(`Command ${ msg.cmd } has not been implemented.`);
};

Account.prototype._applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'accountOpened') {
      this.balance = x.initialBalance;
    } else if (x.event === 'accountCredited') {
      this.balance += x.amount;
    } else if (x.event === 'accountDebited') {
      this.balance -= x.amount;
    } else if (x.event === 'accountDebitedBecauseOfMoneyTransfer') {
      this.balance -= x.amount;
    } else if (x.event === 'accountCreditedBecauseOfMoneyTransfer') {
      this.balance += x.amount;
    } else {
      throw new Error(`Apply event ${ x.event } has not been implemented yet`);
    }
  }
};
