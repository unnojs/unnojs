Unno.component('MyButton', ['$dom'], function(D) {

   var MyButton = {

      handleClick: function(e) {
         e.stopPropagation();
         alert('Yeah! You were cliked on button B.');
      },

      render: function() {
         return D.button({type:'button', className:'button', onClick: this.handleClick }, 'Click Me B!')
      }
   };

   return MyButton;
});
