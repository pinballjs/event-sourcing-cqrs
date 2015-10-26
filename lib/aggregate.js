'use strict';

let _ = require('lodash');

module.exports = Aggregate;

function Aggregate() {
}

Aggregate.findOrCreate = function(Klass) {
  return function *findOrCreate(act, guid) {
    let instance = new Klass();
    instance._act = act;
    if (guid) {
      let reply = yield act({
        role: 'eventstore',
        cmd: 'find',
        guid: guid
      });
      instance._applyEvents(reply.events);
      instance._version = reply.version;
      return instance;
    } else {
      return instance;
    }
  };
};

Aggregate.prototype._save = function *(events) {
  events = _.isArray(events) ? events : [events];
  this._applyEvents(events);
  if (this.guid) {
    return yield this._act({
      role: 'eventstore',
      cmd: 'update',
      guid: this.guid,
      events: events,
      version: this._version
    });
  } else {
    return yield this._act({
      role: 'eventstore',
      cmd: 'save',
      events: events
    });
  }
};

Aggregate.prototype.processCommand = function *() {
  throw new Error('processCommand has not been implemented yet.');
};

Aggregate.prototype._applyEvents = function() {
  throw new Error('_applyEvents has not been implemented yet.');
};
