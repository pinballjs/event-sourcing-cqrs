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
        let guid = e.from;
        let account = yield Account.findByGuid(act, guid);
        yield account.processCommand({
          cmd: 'debitBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          amount: e.amount,
          transaction: e.guid,
        });
        yield account.update(act);
      } else if (e.event === 'accountDebitedBecauseOfMoneyTransfer') {
        let guid = e.to;
        let account = yield Account.findByGuid(act, guid);
        yield account.processCommand({
          cmd: 'creditBecauseOfMoneyTransfer',
          from: e.from,
          to: e.to,
          transaction: e.transaction,
          amount: e.amount
        });
        yield account.update(act);
      }
    }
  }
};
