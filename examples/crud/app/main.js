regular.module('app', ['$react', '$storage', 'App'], function(React, Storage, App) {
   React.render(App({}), document.getElementById('app'));
});
