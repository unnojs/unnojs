/*
* Base Store implementation
*/
(function (global, exports) {

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
			if (!unno.util.isFunction(handler)) return;
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

	function AppStore() {
		Store.call(this);
	}

	function store(name, deps, obj) {
		var storeDef, _store, dependencies, hasActionHandler = false;
		// gets store object by name
		if (arguments.length == 1) {
			return this.stores[name];
		}

		if (arguments.length < 3) {
			throw new Error(name+' store signature does not defined correctly.');
		}

		deps = deps || [];
		try {
			dependencies = this.loadDependencies(deps);
		} catch (e) {
			this.queue(name, { type:'store', dependencies: deps, value: obj, fail: e.depName });
			return;
		}

		storeDef = obj.apply(null, dependencies);

		this.util.copy(storeDef, AppStore);
		this.util.copy(Store.prototype, AppStore);
		_store = new AppStore();

		if (_store.init) _store.init();
		if (this.util.isNull(_store.name)) {
			_store.name = name;
		}

		if (_store.binds)
			hasActionHandler = true;

		if (!hasActionHandler) console.warn(name + ' store did not define the [binds] property.');
		this.stores[name] = _store;
	}

	if (global) global.store = store;
	if (exports) exports.store = store;
})(window.Unno, window.unno);
