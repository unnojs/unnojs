/*
* unno.js: main file.
* version: 1.1.0
*
* All rights reserved.
*
* (C) 2014, David Farias, Keuller Magalhaes
* MIT LICENSE
*/
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

   function _copy(from, to) {
     Object.keys(from).forEach(function(key) {
       if (to.prototype) { to.prototype[key] = from[key]; }
       else { to[key] = from[key]; }
     });
   }

   var ChangeStatePropertyMixin = {
      changeState: function(property, value) {
         var _state = this.state;
         _state[property] = value;
         this.setState(_state);
      }
   };

   var Unno = {
      VERSION: '1.1.0',
      util: {
         each: each,
         merge: _copy,
         copy: _copy,
         isNull: isNull,
         isObject: isObject,
         isArray: isArray,
         isFunction: isFunction
      },
      __queue__: {},
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

      // dispara uma acao no sistema
      trigger: function(expr, data) {
         var meta, instance, action, callback;
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

   global.Unno = Unno;
   global.unno = Unno;
})(window);
