Unno.module('app', ['$react', '$router'], function(React, Router) {
   'use strict';

   var TodoApp = Unno.component('TodoApp');

   React.render(TodoApp({}), document.getElementById('app'));
});
