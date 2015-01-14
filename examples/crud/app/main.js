Unno.module('app', ['$react', 'App'], function(React, App) {

   Unno.createActions({
      'ADD': 'ADD_CONTACT',
      'DEL': 'DEL_CONTACT',
      'GET': 'GET_CONTACTS'
   });

   React.render(App({}), document.getElementById('app'));
});
