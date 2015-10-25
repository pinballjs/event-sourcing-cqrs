'use strict';

module.exports = Account;

function Account() {}

Account.prototype.processCommand = function *(msg) {
  if (msg.cmd === 'open') {
    return [{
      event: 'accountOpened',
      initialBalance: msg.initialBalance
    }];
  } else if (msg.cmd === 'credit') {
    return [{
      event: 'accountCredited',
      amount: msg.amount
    }];
  } else if (msg.cmd === 'debit') {
    return [{
      event: 'accountDebited',
      amount: msg.amount
    }];
  } else if (msg.cmd === 'debitBecauseOfMoneyTransfer') {
    return [{
      event: 'accountDebitedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    }];
  } else if (msg.cmd === 'creditBecauseOfMoneyTransfer') {
    return [{
      event: 'accountCreditedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    }];
  } else {
    throw new Error('Command not implemented yet');
  }
};

Account.prototype.applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'accountOpened') {
      this.balance = x.initialBalance;
    } else if (x.event === 'accountCredited') {
      this.balance += x.amount;
    } else if (x.event === 'accountDebited') {
      this.balance -= x.amount;
    } else if (x.event === 'accountDebitedBecauseOfMoneyTransfer') {
      this.balance -= x.amount;
    } else {
      throw new Error('Apply not implemented yet');
    }
  }
};
