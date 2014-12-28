Unno.component('Home', ['$dom', 'MyButton'], function(D, MyButton) {
   var div = D.div;

   var Home = {
      handleClick: function(e) {
         e.stopPropagation();
         Unno.trigger('SimpleStore.show');
      },

      handleEvent: function() {
         alert('SimpleStore event.');
      },

      componentWillMount: function() {
         this.eventId = Unno.listen('SimpleStoreChange', this.handleEvent);
      },

      componentWillUnmount: function() {
         Unno.unlisten(this.eventId);
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
