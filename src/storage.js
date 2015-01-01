/* -----------------------------------------------------------------------
* Local Storage
*/
(function (global, exports) {
	var Storage = function() {
		this.hasStorage = (function() {
			try {
				return 'localStorage' in window && window.localStorage !== null;
			} catch (e) { return false; }
		})();
	};

	Storage.prototype = {
		add: function(key, value) {
			if (!this.hasStorage) throw new Error('LocalStorage does not supported.');
			if (typeof value === 'string') {
				window.localStorage.setItem(key, value);
			} else {
				window.locaStorage.setItem(key, JSON.stringfy(value));
			}
		},

		get: function(key) {
			if (!this.hasStorage) throw new Error('LocalStorage does not supported.');
			return window.localStorage.getItem(key);
		},

		remove: function(key) {
			window.localStorage.removeItem(key);
		},

		clear: function() {
			if (!this.hasStorage) throw new Error('LocalStorage does not supported.');
			window.localStorage.clear();
		}
	};

	if (global) global.services.storage = new Storage();
	if (global) exports.services.storage = new Storage();
})(window.Unno, window.unno);
