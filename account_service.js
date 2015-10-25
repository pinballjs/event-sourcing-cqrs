'use strict';

let Account = require('./account');

exports.openAccountService = openAccountService;
exports.accountService = accountService;

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

