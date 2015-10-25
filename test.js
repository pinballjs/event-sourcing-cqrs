'use strict';

let uuid = require('node-uuid');

function Account() {
}

Account.prototype.processCommand = function() {
};

Account.prototype.applyEvent = function() {
};

function OpenAccountCommand(initialBalance) {
  this.initialBalance = initialBalance;
}

function AccountOpenedEvent(initialBalance) {
  this.initialBalance = initialBalance;
}

function AccountService() {
}

AccountService.prototype.openAccount = function(initialBalance) {
};

function MoneyTransfer() {
}

function EventStore() {
}

EventStore.prototype.save = function() {
};

EventStore.prototype.update = function() {
};

EventStore.prototype.find = function() {
};

let msg = {
  cmd: 'OpenAccountCommad',
  initialBalance: 3
};

msg = {
  event: 'AccountOpenedEvent',
  initialBalance: 3
};
