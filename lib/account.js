'use strict';

let _ = require('lodash');

module.exports = Account;

function Account() {
}

Account.findOrCreate = function *(act, guid) {
  let account = new Account();
  account._act = act;
  if (guid) {
    let reply = yield act({
      role: 'eventstore',
      cmd: 'find',
      guid: guid
    });
    account._applyEvents(reply.events);
    account._version = reply.version;
    return account;
  } else {
    return account;
  }
};

Account.prototype._create = function *(events) {
  events = _.isArray(events) ? events : [events];
  this._applyEvents(events);
  return yield this._act({
    role: 'eventstore',
    cmd: 'save',
    events: events
  });
};

Account.prototype._update = function *(events) {
  events = _.isArray(events) ? events : [events];
  this._applyEvents(events);
  return yield this._act({
    role: 'eventstore',
    cmd: 'update',
    guid: this.guid,
    events: events,
    version: this._version
  });
};

Account.prototype.processCommand = function *(msg) {
  if (msg.cmd === 'open') {
    return yield this._create({
      event: 'accountOpened',
      initialBalance: msg.initialBalance
    });
  } else if (msg.cmd === 'credit') {
    return yield this._update({
      event: 'accountCredited',
      amount: msg.amount
    });
  } else if (msg.cmd === 'debit') {
    return yield this._update({
      event: 'accountDebited',
      amount: msg.amount
    });
  } else if (msg.cmd === 'debitBecauseOfMoneyTransfer') {
    return yield this._update({
      event: 'accountDebitedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    });
  } else if (msg.cmd === 'creditBecauseOfMoneyTransfer') {
    return yield this._update({
      event: 'accountCreditedBecauseOfMoneyTransfer',
      transaction: msg.transaction,
      amount: msg.amount,
      from: msg.from,
      to: msg.to
    });
  } else {
    throw new Error(`Command ${ msg.cmd } has not been implemented yet.`);
  }
};

Account.prototype._applyEvents = function(events) {
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
    } else if (x.event === 'accountCreditedBecauseOfMoneyTransfer') {
      this.balance += x.amount;
    } else {
      throw new Error(`Apply event ${ x.event } has not been implemented yet`);
    }
  }
};
