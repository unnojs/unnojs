Unno.module('app', [
   '$react',
   'TodoApp',
], function(React, TodoApp) {
  React.render(TodoApp({}), document.getElementById('app'));
});
