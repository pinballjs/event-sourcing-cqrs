'use strict';

let promise = require('bluebird');
let co = require('co');
let Account = require('./account');

module.exports = function(pinball) {
  let act = pinball.act.bind(pinball);
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
        let account = yield Account.findOrCreate(act, e.from);
        yield account.processCommand({
          cmd: 'debitBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          amount: e.amount,
          transaction: e.guid,
        });
      } else if (e.event === 'accountDebitedBecauseOfMoneyTransfer') {
        let account = yield Account.findOrCreate(act, e.to);
        yield account.processCommand({
          cmd: 'creditBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          transaction: e.transaction,
          amount: e.amount
        });
      }
    }
  }
};
