(function() {
   var isIE = /*@cc_on!@*/false || !!document.documentMode;
   if (!isIE) return;

   function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: undefined };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
   }
   CustomEvent.prototype = window.Event.prototype;
   window.CustomEvent = CustomEvent;
})();

(function(global) {
   'use strict';
   var attr;

   /*----------------- Utilities/Helpers ---------------------------------- */
   function isNull(value) { return (value === null || value === undefined); }
   function isObject(value) { return (typeof value === 'object'); }
   function isFunction(value) { return (typeof value === 'function'); }
   function isArray(value) { return (value instanceof Array); }

   function each(list, callback) {
      if (isNull(list) || isFunction(list)) return;
      for(var idx=0, count = list.length; idx<count; idx++) {
         callback(list[idx], idx);
      }
   }

   function _merge(from, to) {
     Object.keys(from).forEach(function(key) {
       if (to.prototype) { to.prototype[key] = from[key]; }
       else { to[key] = from[key]; }
     });
   }

   /* -----------------------------------------------------------------------
   * Local Storage
   */
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
            return;
         }
         throw new Error('You cannot add this type on local storage. Key: ' + key);
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

   /* -----------------------------------------------------------------------
   * Dispatcher
   */
   var Dispatcher = function() {
      this._lastId = 0;
      this._prefix = 'id_';
      this._callbacks = Object.create({});
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
         if (!isObject(_events)) { //there is events
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
   /* ------------------------[End Dispatcher]--------------------------- */

   /* -----------------------------------------------------------------------
   * Base Store implementation
   */
   function Store() {
      this.data = null;
      this.error = null;
   }

   Store.prototype = {
      notify: function() {
         Unno.notify(this.name, this.error, this.data);
      },
      setData: function(value) { this.data = value; },
      getData: function() { return this.data; },
      setError: function(err) { this.error = err; }
   };
   /*-------------------------[End Store]--------------------------------- */

   var ChangeStatePropertyMixin = {
      changeState: function(property, value) {
         var _state = this.state;
         _state[property] = value;
         this.setState(_state);
      }
   };

   function scripts() { return document.getElementsByTagName('script'); }

   function AppStore() {
      Store.call(this);
   }

   global.Unno = {
      VERSION: '1.0.0',
      util: {
         each: each,
         merge: _merge,
         isNull: isNull,
         isObject: isObject,
         isArray: isArray,
         isFunction: isFunction
      },
      __queue__: {},
      dispatcher: new Dispatcher(),
      services: {},
      modules: {},
      components: {},
      imports: {},
      stores: {},

      processQueue: function() {
         var key, obj, o=[], count=0;
         for(key in this.__queue__) {
            obj = this.__queue__[key];
            if (obj.type === 'component') {
               this.component(key, obj.dependencies, obj.value);
               o.push(key);
            } else if (obj.type === 'store') {
               this.store(key, obj.dependencies, obj.value);
               o.push(key);
            }
            count++;
         }

         if (o.length == count) {
            this.__queue__ = {};
         } else {
            for (key in o) { delete this.__queue__[key]; }
            o='';
            for (key in this.__queue__) { o += key; }
            console.log(o);
            throw new Error('Those dependencies were not found. ' + o.join(','));
         }
      },

      queue: function(name, value) {
         var exists = !!(this.__queue__[name]);
         if(!exists) this.__queue__[name] = value;
      },

      loadDependencies: function(list) {
         var depsArray = [], idx, depName, depsLen, dependency, err;
         for (idx=0, depsLen = list.length; idx < depsLen; idx++) {
            depName = list[idx];
            if (depName.charAt(0) === '$') {
               depName = depName.substring(1);
               dependency = this.services[depName];
            } else {
               dependency = this.modules[depName];
               if (isNull(dependency))
                  dependency = this.components[depName];
            }

            if (isNull(dependency)) {
               err = new Error(depName+' dependency could not be found.');
               err.depName = depName;
               throw err;
            } else
               depsArray.push(dependency);
         }
         return depsArray;
      },

      module: function(name, deps, constructor) {
         var validParams, dependencies = [];
         if (arguments.length < 3) {
            throw new Error(name+' module signature does not defined correctly.');
         }
         validParams = (isFunction(constructor) && isArray(deps));
         if (!validParams) {
            throw new Error(name+' module does not define correct parameters type. Hint: [string, array, function]');
         }

         if (name === 'app' || name === 'main') {
            this.processQueue();
            dependencies = this.loadDependencies(deps);
            constructor.apply(null, dependencies);
         } else {
            dependencies = this.loadDependencies(deps);
            this.modules[name] = constructor.apply(null, dependencies);
         }

      },

      component: function(name, deps, obj) {
         var key, R = this.services.react, component, componentClass, dependencies = [];
         if (arguments.length < 3) {
            throw new Error(name+' component signature does not defined correctly.');
         }

         for(key in this.components) {
            if(key === name) {
               console.error('There is another component registered with same name ['+name+']');
               return;
            }
         }

         deps = deps || [];
         try {
            dependencies = this.loadDependencies(deps);
         } catch (e) {
            this.queue(name, { type:'component', dependencies: deps, value: obj, fail: e.depName });
            return;
         }

         component = obj.apply(null, dependencies);
         component.displayName = name;
         componentClass = R.createClass(component);
         this.components[name] = R.createFactory(componentClass);
      },

      store: function(name, deps, obj) {
         var storeDef, _store, dependencies;
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

         _merge(storeDef, AppStore);
         _merge(Store.prototype, AppStore);
         _store = new AppStore();

         if(_store.init) _store.init();
         if(isNull(_store.name)) {
            _store.name = name;
         }
         if(isNull(_store.url)) {
            console.warn('You did not defined the property "url" for "'+name+'" store object.');
            _store.url = '';
         }
         this.stores[name] = _store;
      },

      // dispara uma acao no sistema
      trigger: function(expr, data) {
         var meta, instance, action, callback;
         meta = expr.split('.');
         instance = this.stores[meta[0]];
         if (instance) {
            callback = instance[meta[1]];
            if (data) { callback.call(instance, data); }
            else { callback.call(instance); }
         } else {
            console.warn(meta[0]+' store object could not be found.');
         }
      },

      dispatch: function(event, error, payload) {
         if (error)
            this.dispatcher.dispatch(event, error, null);
         else
            this.dispatcher.dispatch(event, null, payload);
      },

      notify: function(storeName, error, payload) {
         var eventName = (storeName + 'Change');
         this.dispatcher.dispatch(eventName, error, payload);
      },

      listen: function(eventName, callback) {
         return this.dispatcher.register(eventName, callback);
      },

      unlisten: function(id) {
         this.dispatcher.unregister(id);
      }
   };

   var _addons = React.addons;
   _addons.ChangeStatePropertyMixin = ChangeStatePropertyMixin;

   Unno.services.storage = new Storage();
   Unno.services.react = React;
   Unno.services.addons = _addons;
   Unno.services.dom = React.DOM;
   Unno.services.router = ReactRouter;
})(window);
