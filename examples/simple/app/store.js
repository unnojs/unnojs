Unno.store('SimpleStore', [], function() {

   var SimpleStore = {
      url: '',

      init: function() {
         console.log('initializing SimpleStore.');
      },

      show: function() {
         console.log('invoking "show" method from SimpleStore.');

         // simulates 1.5s delay
         setTimeout(function() {
            this.notify();
         }.bind(this), 1000);
      }
   };

   return SimpleStore;
});
