'use strict';

let MoneyTransfer = require('./money_transfer');
let promise = require('bluebird');
let co = require('co');

module.exports = function(pinball) {
  let act = pinball.act.bind(pinball);
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
      if (e.event === 'accountDebitedBecauseOfMoneyTransfer') {
        let moneyTransfer = yield MoneyTransfer.findOrCreate(act, e.transaction);
        yield moneyTransfer.processCommand({
          cmd: 'debite',
          from: e.from,
          to: e.to,
          amount: e.amount
        });
      } else if (e.event === 'accountCreditedBecauseOfMoneyTransfer') {
        let moneyTransfer = yield MoneyTransfer.findOrCreate(act, e.transaction);
        yield moneyTransfer.processCommand({
          cmd: 'complete',
          from: e.from,
          to: e.to,
          amount: e.amount
        });
      }
    }
  }
};
