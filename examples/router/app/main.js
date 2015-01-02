Unno.createActions({
    'SHOW': 'SHOW_ACTION'
});

Unno.module('main', ['$react', '$router', 'Header', 'Home', 'About'],
function(React, Router, Header, Home, About) {
   'use strict';

   var Route = React.createFactory(Router.Route),
       DefaultRoute = React.createFactory(Router.DefaultRoute),
       routes;

   routes = (
      Route({ handler: Header, path:'/' },
         DefaultRoute({ name:'index', handler: Home }),
         Route({ name:'about', handler: About })
      )
   );

   Router.run(routes, function(Handler) {
      React.render(React.createElement(Handler, {}), document.getElementById('app'));
   });

});
