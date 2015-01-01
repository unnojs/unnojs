Unno.module('app', ['$react'], function(React) {
   'use strict';

   var TodoApp = Unno.component('TodoApp');

   React.render(TodoApp({}), document.getElementById('app'));
});
