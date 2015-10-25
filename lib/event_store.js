'use strict';

let uuid = require('node-uuid');

module.exports = eventStore;

/**
 * guid is a reserved key and it's created by event store for every event
 * automatically.
 */
function eventStore(pinball) {
  let store = {
  };
  let events = [];
  let es = {
    save: function *save(done) {
      let guid = uuid.v4();
      events = events.concat(addGuid(guid, this.events));
      store[guid] = this.events;
      done({
        guid: guid
      });
    },
    find: function *find(done) {
      done({
        events: store[this.guid],
        version: store[this.guid].length
      });
    },
    update: function *update(done) {
      let changes = store[this.guid];
      if (this.version === changes.length) {
        events = events.concat(addGuid(this.guid, this.events));
        store[this.guid] = changes.concat(this.events);
        done();
      } else {
        throw new Error('Optimistic lock failed');
      }
    },
    getEvents: function *getEvents(done) {
      let offset = this.offset || 0;
      let batchSize = this.batchSize || 10;
      let max = events.length - offset;
      batchSize = Math.min(batchSize, max);
      done({
        offset: offset + batchSize,
        events: events.slice(offset, offset + batchSize)
      });
    },
    /**
     * debug method
     */
    _getStore: function() {
      return store;
    },
    /**
     * debug method
     */
    _getEvents: function() {
      return events;
    }
  };
  pinball.add({ role:'eventstore', cmd:'save' }, es.save)
         .add({ role:'eventstore', cmd:'find' }, es.find)
         .add({ role:'eventstore', cmd:'update' }, es.update)
         .add({ role:'eventstore', cmd:'getEvents' }, es.getEvents);
  return es;
}

/**
 * It changes events, so that we save in every event the guid of the aggregate root
 */
function addGuid(guid, events) {
  for (let e of events) {
    e.guid = guid;
  }
  return events;
}
