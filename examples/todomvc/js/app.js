Unno.module('app', ['$react', '$router', 'TodoApp'], function(React, Router, TodoApp) {
   React.render(TodoApp({}), document.getElementById('app'));
});
