/*
* unno.js: main file.
* version: 1.1.0
*
* All rights reserved.
*
* (C) 2014
* MIT LICENSE
*/
var React = require('react'),
    Addons = require('react/lib/ReactWithAddons'),
    Utils = require('./util'),
    Store = require('./store'),
    Storage = require('./storage'),
    Dispatcher  = require('./dispatcher'),
    ReactRouter = require('react-router');

var attr;

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

var ChangeStatePropertyMixin = {
    changeState: function(property, value) {
        var _state = this.state;
        _state[property] = value;
        this.setState(_state);
    }
};

/*------- Action -------*/
function Action(name, type) {
    this._name = name;
    this._type = type;
}

Action.prototype.trigger = function(data) {
    Dispatcher.fire({
        type: this._type,
        source: (data || '')
    });
};

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
               if (Utils.isNull(dependency))
                  dependency = this.components[depName];
            }

            if (Utils.isNull(dependency)) {
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

         validParams = (Utils.isFunction(constructor) && Utils.isArray(deps));
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
            if (Utils.isObject(component)) {
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
    },

    createActions: function(def) {
        if (!Utils.isObject(def)) return;

        Object.keys(def).forEach(function(name) {
            if (this.actions[name])
                console.warn('The '+name+' action already exists in the registry with another handler.');
            else
                this.actions[name] = new Action(name, def[name]);
        }.bind(this));
    },

    trigger: function(expr, data) {
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
    },

    render: function(component, elementId) {
        React.render(component, document.getElementById(elementId));
    },

    store: function(name, deps, obj) {
        function AppStore() {
            Store.call(this);
        }

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

        Utils.copy(storeDef, AppStore);
        Utils.copy(Store.prototype, AppStore);
        _store = new AppStore();

        if (_store.init) _store.init();
        if (Utils.isNull(_store.name)) {
            _store.name = name;
        }

        if (_store.binds) hasActionHandler = true;

        if (!hasActionHandler) console.warn(name + ' store did not define the [binds] property.');
        this.stores[name] = _store;
    }
};

var _addons = Addons.addons;
_addons.ChangeStatePropertyMixin = ChangeStatePropertyMixin;

Unno.services = {
    react: React,
    addons: _addons,
    dom: React.DOM,
    router: ReactRouter,
    storage: Storage,
    dispatcher: Dispatcher
};

module.exports = Unno;
