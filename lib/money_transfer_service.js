'use strict';

let MoneyTransfer = require('./money_transfer');

module.exports = function(pinball) {
  pinball.add({ role:'moneyTransfer', cmd:'create' }, createMoneyTransferService);
  require('./money_transfer_handler')(pinball);
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
