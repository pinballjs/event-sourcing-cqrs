'use strict';

module.exports = Account;

function Account() {
  this._events = [];
}

Account.findByGuid = function *(act, guid) {
  let account = new Account();
  let reply = yield act({
    role: 'eventstore',
    cmd: 'find',
    guid: guid
  });
  account.applyEvents(reply.events);
  account._version = reply.version;
  return account;
};

Account.prototype.create = function *(act) {
  let reply = yield act({
    role: 'eventstore',
    cmd: 'save',
    events: this._events
  });
  this._events = [];
  return reply;
};

Account.prototype.update = function *(act) {
  yield act({
    role: 'eventstore',
    cmd: 'update',
    guid: this.guid,
    events: this._events,
    version: this._version
  });
};

Account.prototype.processCommand = function *(msg) {
  if (msg.cmd === 'open') {
    this._events.push({
      event: 'accountOpened',
      initialBalance: msg.initialBalance
    });
  } else if (msg.cmd === 'credit') {
    this._events.push({
      event: 'accountCredited',
      amount: msg.amount
    });
  } else if (msg.cmd === 'debit') {
    this._events.push({
      event: 'accountDebited',
      amount: msg.amount
    });
  } else if (msg.cmd === 'debitBecauseOfMoneyTransfer') {
    this._events.push({
      event: 'accountDebitedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    });
  } else if (msg.cmd === 'creditBecauseOfMoneyTransfer') {
    this._events.push({
      event: 'accountCreditedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    });
  } else {
    throw new Error('Command not implemented yet');
  }
};

Account.prototype.applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'accountOpened') {
      this.balance = x.initialBalance;
      this.guid = x.guid;
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
