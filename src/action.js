/*
* Base Action implementation
*/
(function (global, exports) {

   function Action(name, type) {
      this._name = name;
      this._type = type;
   }

   Action.prototype.trigger = function(data) {
      unno.dispatcher.fire({
         type: this._type,
         source: (data || '')
      });
   }

   function _createActions(def) {
      if (!this.util.isObject(def)) return;
      Object.keys(def).forEach(function(name) {
         if (this.actions[name])
            console.warn('The '+name+' action already exists in the registry with another handler.');
         else
            this.actions[name] = new Action(name, def[name]);
      }.bind(this));
   }

   // dispara uma acao no sistema
   function _trigger(expr, data) {
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
   }

   global.createActions = _createActions;
   global.trigger = _trigger;

   if (exports) {
      exports.createActions = _createActions;
      exports.trigger = _trigger;
   }
})(window.Unno, window.unno);
