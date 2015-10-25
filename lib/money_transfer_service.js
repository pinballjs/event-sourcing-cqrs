'use strict';

let MoneyTransfer = require('./money_transfer');
let promise = require('bluebird');
let co = require('co');

module.exports = function(pinball) {
  pinball.add({ role:'moneyTransfer', cmd:'create' }, createMoneyTransferService);

  co(function *moneyTransferEventListener() {
    let offset = 0;
    for(;;) {
      yield promise.delay(100);
      let reply = yield pinball.act({
        role: 'eventstore',
        cmd: 'getEvents',
        offset: offset
      });
      yield moneyTransferEventsHandler(reply.events);
      offset = reply.offset;
    }
  }).catch(function(err) {
    console.log(err.stack);
  });

  function *moneyTransferEventsHandler(events) {
    for (let e of events) {
      if (e.event === 'accountCreditedBecauseOfMoneyTransfer') {
        let moneyTransfer = new MoneyTransfer();
        let guid = e.transaction;
        let reply = yield pinball.act({
          role: 'eventstore',
          cmd: 'find',
          guid: guid
        });
        moneyTransfer.applyEvents(reply.events);
        let newEvents = yield moneyTransfer.processCommand({
          cmd: 'complete',
          from: e.from,
          to: e.to,
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

function *createMoneyTransferService(done, act) {
  let moneyTransfer = new MoneyTransfer();
  let events = yield moneyTransfer.processCommand(this);
  done(yield act({
    role: 'eventstore',
    cmd: 'save',
    events: events
  }));
}
