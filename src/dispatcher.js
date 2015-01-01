/* -----------------------------------------------------------------------
* Dispatcher
*/
(function (global, exports) {
	var Dispatcher = function() {
		this._lastId = 0;
		this._prefix = 'id_';
		this._events = Object.create({});
	};

	Dispatcher.prototype = {
		dispatch: function(eventName, err, payload) {
			var events = this._events[eventName];
			if (events) {
				events.forEach(function(event) {
					event.handler.apply(null, [err, payload]);
				});
			}
		},

		register: function(eventName, callback) {
			var _id = (this._prefix + this._lastId++),
				 _events = this._events[eventName];

			if (!global.util.isObject(_events)) { //there is events
				_events = [];
			}

			_events.push({ id: _id, handler: callback });
			this._events[eventName] = _events;
			return _id;
		},

		unregister: function(id) {
			var idx, _event, count, handler, pos;

			if (id) {
				Object.keys(this._events).forEach(function(key) {
					_event = this._events[key];
					handler = null;
					pos = -1;
					for (idx=0, count = _event.length; idx < count; idx++) {
						handler = _event[idx];
						if (handler.id === id) {
							pos = idx;
							break;
						}
					}

					if (pos >= 0) {
						_event.splice(pos, 1);
						this._events[key] = _event;
					}
				}.bind(this));
			}
		}

	};

	if (exports) exports.dispatcher = new Dispatcher();
	if (global) global.dispatcher = new Dispatcher();
})(window.Unno, window.unno);
/* ------------------------[End Dispatcher]--------------------------- */
