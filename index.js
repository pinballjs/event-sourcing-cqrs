'use strict';

let promise = require('bluebird');
let co = require('co');

let pinball = require('pinball')('example');
pinball.use('eventemitter');
let es = require('./lib/event_store')(pinball);
require('./lib/account_service')(pinball);
require('./lib/money_transfer_service')(pinball);

co(function *main() {
  yield promise.delay(100);
  let acc1 = yield pinball.act({
    role: 'account',
    cmd: 'open',
    initialBalance: 0
  }, 1000, 1);
  yield pinball.act({
    role: 'account',
    cmd: 'credit',
    guid: acc1.guid,
    amount: 200
  }, 1000, 1);
  let acc2 = yield pinball.act({
    role: 'account',
    cmd: 'open',
    initialBalance: 10
  }, 1000, 1);
  yield pinball.act({
    role: 'moneyTransfer',
    cmd: 'create',
    from: acc1.guid,
    to: acc2.guid,
    amount: 30
  });
  yield promise.delay(500);

  let print = require('./lib/utils').print;
  print(es._getStore());
  print(es._getEvents());
}).catch(function(err) {
  let print = require('./lib/utils').print;
  print(es._getStore());
  print(es._getEvents());
  console.log(err.stack);
});
