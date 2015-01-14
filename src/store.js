var Utils = require('./util');

function Store() {
    this._handlers = [];
    this.state = null;
}

Store.prototype = {
    notify: function() {
        var handlers = this._handlers, self = this;
        handlers.forEach(function(handler) {
            handler.call(null, self.state);
        });
    },
    on: function(handler) {
        if (!Utils.isFunction(handler)) return;
        this._handlers.push(handler);
    },
    off: function(handler) {
        var handlers = this._handlers;
        this._handlers = handlers.filter(function(obj) {
            return (obj !== handler);
        });
    },
    setData: function(value) { this.state = value; }, // @deprecated, will be removed in 1.2.0
    getData: function() { return this.state; }, // @deprecated, use getState
    getState: function() { return this.state; }
};

module.exports = Store;
