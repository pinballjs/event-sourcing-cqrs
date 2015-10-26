'use strict';

let Account = require('./account');

module.exports = function(pinball) {
  pinball.add({ role:'account', cmd:'open' }, openAccountService)
         .add({ role:'account' }, accountService);

  require('./account_handler')(pinball);
};

function *openAccountService(done, act) {
  let account = new Account();
  yield account.processCommand(this);
  done(yield account.create(act));
}

function *accountService(done, act) {
  let guid = this.guid;
  let account = yield Account.findByGuid(act, guid);
  yield account.processCommand(this);
  yield account.update(act);
  done();
}
