Unno.store('SimpleStore', [], function() {

   var SimpleStore = {
      init: function() {
         console.log('initializing SimpleStore.');
         this.state = {};
      },

      show: function() {
         console.log('invoking "show" method from SimpleStore.');
         // simulates 1.5s delay
         setTimeout(function() {
            this.notify();
         }.bind(this), 1000);
      },

      binds: {
         'SHOW_ACTION': 'show'
      }
   };

   return SimpleStore;
});
