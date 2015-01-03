/*
* unno.js: main file.
* version: 1.1.0
*
* All rights reserved.
*
* (C) 2014
* MIT LICENSE
*/
(function () {
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

(function(root, factory) {
   if ( typeof define === "function" && define.amd ) {
      // AMD
      define(['unno'], factory);
   } else if ( typeof module === "object" && module.exports ) {
      // Node, or CommonJS-Like environments
      module.exports = factory( this );
   } else {
      // Browser globals
      root.Unno = factory( root );
      root.unno = root.Unno;
   }
}(this, function(global) {
   'use strict';
   var attr;

   var ChangeStatePropertyMixin = {
      changeState: function(property, value) {
         var _state = this.state;
         _state[property] = value;
         this.setState(_state);
      }
   };

   /*------- Utilities ------- */
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

   function _copy(from, to) {
      Object.keys(from).forEach(function(key) {
         if (to.prototype) {
            to.prototype[key] = from[key];
         } else {
            to[key] = from[key];
         }
      });
   }

   var Utils = { // @deprecated, in 1.2.0 version will be a injected service
      each: each, // @deprecated, will be removed in next version
      merge: _copy, // @deprecated, will be removed in next version
      copy: _copy,
      isNull: isNull,
      isObject: isObject,
      isArray: isArray,
      isFunction: isFunction
   };

   /*------- [End Utilities] -------*/

   var Unno = {
      VERSION: '1.1.0',
      util: Utils,
      __queue__: {},
      services: {},
      actions: {},
      modules: {},
      components: {},
      stores: {},

      processQueue: function() {
         var key, obj, deps=[], count=0;
         for(key in this.__queue__) {
            obj = this.__queue__[key];
            if (obj.type === 'component') {
               this.component(key, obj.dependencies, obj.value);
               deps.push(key);
            } else if (obj.type === 'store') {
               this.store(key, obj.dependencies, obj.value);
               deps.push(key);
            }
            count++;
         }

         if (deps.length == count) {
            this.__queue__ = {};
         } else {
            for (key in deps) { delete this.__queue__[key]; }
            deps='';
            for (key in this.__queue__) { deps += key; }
            throw new Error('Those dependencies were not found. ' + deps.join(','));
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
               if (this.util.isNull(dependency))
                  dependency = this.components[depName];
            }

            if (this.util.isNull(dependency)) {
               err = new Error(depName+' dependency could not be found.');
               err.dependency = depName;
               throw err;
            } else
               depsArray.push(dependency);
         }
         return depsArray;
      },

      module: function(name, deps, constructor) {
         var validParams, dependencies = [];

         // returns a module from registry
         if (arguments.length == 1) return this.modules[name];

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

      // register or gets a component into registry
      component: function(name, deps, obj) {
         var key, R = this.services.react, component, componentClass, dependencies = [];

         if (arguments.length == 1) return this.components[name];

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

         // checks if JSX transformer exists
         if (window.JSXTransformer) {
            this.components[name] = R.createFactory(component);
         } else {
            component.displayName = name;
            if (isObject(component)) {
               componentClass = R.createClass(component);
               this.components[name] = R.createFactory(componentClass);
            } else if (isFunction(component)) {
               this.components[name] = R.createFactory(component);
            }
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

   Unno.services.react = React;
   Unno.services.addons = _addons;
   Unno.services.dom = React.DOM;
   Unno.services.router = ReactRouter;

   /*------- [Dispatcher] -------*/
   var Dispatcher = function() {
      this._lastId = 0;
      this._prefix = 'id_';
      this._events = Object.create({});
   };

   Dispatcher.prototype = {
      // this method will be your signature changed in 1.2.0 version
      dispatch: function(eventName, err, payload) {
         var events = this._events[eventName];
         if (events) {
            events.forEach(function(event) {
               event.handler.apply(null, [err, payload]);
            });
         }
      },

      // this method will be removed in 1.2.0 version
      fire: function(payload) {
         var _stores = unno.stores, _store, funcName = '', _binds;

         Object.keys(_stores).forEach(function(storeName) {
            _store = _stores[storeName];
            Object.keys(_store.binds).forEach(function(actionType) {
               funcName = _store.binds[actionType];
               if (actionType === payload.type) {
                  _store[funcName].call(_store, payload.source);
               }
            });
         });
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

      // this method will be removed in 1.2.0 version
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

   Unno.dispatcher = new Dispatcher();

   /*------- Store -------*/
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

   Unno.store = function(name, deps, obj) {
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
   };

   /*------- Action -------*/
   function Action(name, type) {
      this._name = name;
      this._type = type;
   }

   Action.prototype.trigger = function(data) {
      unno.dispatcher.fire({
         type: this._type,
         source: (data || '')
      });
   };

   Unno.createActions = function(def) {
      if (!this.util.isObject(def)) return;
      Object.keys(def).forEach(function(name) {
         if (this.actions[name])
            console.warn('The '+name+' action already exists in the registry with another handler.');
         else
            this.actions[name] = new Action(name, def[name]);
      }.bind(this));
   };

   // dispara uma acao no sistema
   Unno.trigger = function(expr, data) {
      var meta, instance, action, callback,
          isExpression = (expr.indexOf('.') > 0);

      if (isExpression) {
         meta = expr.split('.');
         instance = this.stores[meta[0]];

         if (instance) {
            callback = instance[meta[1]];
            if (typeof data === 'boolean') { callback.call(instance, data); }
            else if (data) { callback.call(instance, data); }
            else { callback.call(instance); }
         } else {
            console.warn(meta[0]+' store object could not be found.');
         }
         return;
      }

      var listActions = this.actions;
      Object.keys(listActions).forEach(function(actionName) {
         if (actionName === expr) {
            action = listActions[actionName];
            action.trigger(data);
         }
      });
   };

   /*------- [Storage] -------*/
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

   Unno.services.storage = new Storage();
   /*------- [End Storage] -------*/

   return Unno;
}));
