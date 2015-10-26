'use strict';

let Account = require('./account');

module.exports = function(pinball) {
  pinball.add({ role:'account' }, accountService);
  require('./account_handler')(pinball);
};

function *accountService(done, act) {
  let account = yield Account.findOrCreate(act, this.guid);
  done(yield account.processCommand(this));
}
