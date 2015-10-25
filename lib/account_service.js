'use strict';

let promise = require('bluebird');
let co = require('co');
let Account = require('./account');

module.exports = function(pinball) {
  pinball.add({ role:'account', cmd:'open' }, openAccountService)
         .add({ role:'account' }, accountService);

  co(function *accountEventListener() {
    let offset = 0;
    for(;;) {
      yield promise.delay(100);
      let reply = yield pinball.act({
        role: 'eventstore',
        cmd: 'getEvents',
        offset: offset
      });
      yield accountEventsHandler(reply.events);
      offset = reply.offset;
    }
  }).catch(function(err) {
    console.log(err.stack);
  });

  function *accountEventsHandler(events) {
    for (let e of events) {
      if (e.event === 'moneyTransferCreated') {
        let account = new Account();
        let guid = e.from;
        let reply = yield pinball.act({
          role: 'eventstore',
          cmd: 'find',
          guid: guid
        });
        account.applyEvents(reply.events);
        let newEvents = yield account.processCommand({
          cmd: 'debitBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          amount: e.amount,
          transaction: e.guid,
        });
        yield pinball.act({
          role: 'eventstore',
          cmd: 'update',
          guid: guid,
          events: newEvents,
          version: reply.version
        });
      } else if (e.event === 'accountDebitedBecauseOfMoneyTransfer') {
        let account = new Account();
        let guid = e.to;
        let reply = yield pinball.act({
          role: 'eventstore',
          cmd: 'find',
          guid: guid
        });
        account.applyEvents(reply.events);
        let newEvents = yield account.processCommand({
          cmd: 'creditBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          transaction: e.transaction,
          amount: e.amount
        });
        yield pinball.act({
          role: 'eventstore',
          cmd: 'update',
          guid: guid,
          events: newEvents,
          version: reply.version
        });
      }
    }
  }
};

function *openAccountService(done, act) {
  let account = new Account();
  let events = yield account.processCommand(this);
  let reply = yield act({
    role: 'eventstore',
    cmd: 'save',
    events: events
  });
  done(reply);
}

function *accountService(done, act) {
  let account = new Account();
  let reply = yield act({
    role: 'eventstore',
    cmd: 'find',
    guid: this.guid
  });
  account.applyEvents(reply.events);
  let newEvents = yield account.processCommand(this);
  yield act({
    role: 'eventstore',
    cmd: 'update',
    guid: this.guid,
    events: newEvents,
    version: reply.version
  });
  done();
}
