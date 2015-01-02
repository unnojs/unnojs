Unno.component('Home', ['$dom', 'MyButton'], function(D, MyButton) {
   var div = D.div;

   var Home = {
      handleClick: function(e) {
         e.stopPropagation();
         Unno.trigger('SHOW');
      },

      handleEvent: function(state) {
         console.log(state);
         alert('SimpleStore event.');
      },

      componentWillMount: function() {
          Unno.store('SimpleStore').on(this.handleEvent);
      },

      componentWillUnmount: function() {
          Unno.store('SimpleStore').off(this.handleEvent);
      },

      render: function() {
         return div({},
            D.button({type:'button', className:'button', onClick: this.handleClick }, 'Click Me!'),
            String.fromCharCode(160),
            MyButton({})
         )
      }
   };

   return Home;
});
