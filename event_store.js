'use strict';

let uuid = require('node-uuid');

module.exports = eventStore;

function eventStore() {
  let store = {
  };
  return {
    save: function *save(done) {
      let guid = uuid.v4();
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
        store[this.guid] = changes.concat(this.events);
        done();
      } else {
        throw new Error('Optimistic lock failed');
      }
    },
    getStore: function() {
      return store;
    }
  };
}

