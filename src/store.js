/*
* Base Store implementation
*/
(function (global, exports) {

	function Store() {
		this.state = null;
		this.error = null;
	}

	function AppStore() {
		Store.call(this);
	}

	Store.prototype = {
		notify: function() {
			unno.notify(this.name, this.error, this.state);
		},
		setData: function(value) { this.state = value; }, // @deprecated, use setState
		getData: function() { return this.state; }, // @deprecated, use getState
		setState: function(value) { this.state = value; },
		getState: function() { return this.state; },
		setError: function(err) { this.error = err; }
	};

	function store(name, deps, obj) {
		var storeDef, _store, dependencies;
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

		if (this.util.isNull(_store.url)) {
			console.warn('You did not defined property "url" for "'+name+'" store object.');
			_store.url = '';
		}
		this.stores[name] = _store;
	}

	if (global) global.store = store;
	if (exports) exports.store = store;
})(window.Unno, window.unno);
