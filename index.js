'use strict';

let co = require('co');
let pinball = require('pinball')('example');
let prettyjson = require('prettyjson');
let es= require('./event_store')();
let as = require('./account_service');
require('colors');

pinball.use('eventemitter')
       .add({ role:'eventstore', cmd:'save' }, es.save)
       .add({ role:'eventstore', cmd:'find' }, es.find)
       .add({ role:'eventstore', cmd:'update' }, es.update)
       .add({ role:'account', cmd:'open' }, as.openAccountService)
       .add({ role:'account' }, as.accountService);

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
  yield pinball.act({
    role: 'account',
    cmd: 'credit',
    guid: reply.guid,
    amount: 100
  }, 1000, 1);
  yield pinball.act({
    role: 'account',
    cmd: 'debit',
    guid: reply.guid,
    amount: 50
  }, 1000, 1);
  print(es.getStore());
}).catch(function(err) {
  console.log(err.stack);
});


function print(msg) {
  console.log(prettyjson.render(msg));
  console.log('==========================================================================================');
}
