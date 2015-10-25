'use strict';

let co = require('co');
let pinball = require('pinball')('example');
let prettyjson = require('prettyjson');
let eventStore = require('./event_store')();
require('colors');

pinball.use('eventemitter')
       .add({ role:'eventstore', cmd:'save' }, eventStore.save)
       .add({ role:'eventstore', cmd:'find' }, eventStore.find)
       .add({ role:'eventstore', cmd:'update' }, eventStore.update)
       .add({ role:'account', cmd:'open' }, openAccountService)
       .add({ role:'account' }, accountService);

Object.toType = function(obj) {
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase();
};

function *openAccountService(done) {
  let account = new Account();
  let events = account.processCommand(this);
  let reply = yield pinball.act({
    role: 'eventstore',
    cmd: 'save',
    events: events
  });
  account.applyEvents(events);
  done(reply);
}

function *accountService(done) {
  let account = new Account();
  let reply = (yield pinball.act({
    role: 'eventstore',
    cmd: 'find',
    guid: this.guid
  }));
  account.applyEvents(reply.events);
  let newEvents = account.processCommand(this);
  yield pinball.act({
    role: 'eventstore',
    cmd: 'update',
    guid: this.guid,
    events: newEvents,
    version: reply.version
  });
  done();
}

co(function *main() {
  let reply = yield pinball.act({
    role: 'account',
    cmd: 'open',
    initialBalance: 100
  });
  yield pinball.act({
    role: 'account',
    cmd: 'credit',
    guid: reply.guid,
    amount: 200
  }, 1000, 1);
  print(pinball.clean(reply));
}).catch(function(err) {
  console.log(err.stack);
});

function Account() {
}

Account.prototype.processCommand = function(msg) {
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
  }
};

Account.prototype.applyEvents = function(events) {
  for (let x of events) {
    if (x.event === 'accountOpened') {
      this.balance = x.initialBalance;
    } else if (x.event === 'accountCredited') {
      this.balance += x.amount;
    }
  }
};

function print(msg) {
  console.log(prettyjson.render(msg));
  console.log('==========================================================================================');
}
