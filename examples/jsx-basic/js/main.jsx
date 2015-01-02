// main module
Unno.module('main', ['$react', 'Home'], function(React, Home) {
   'use strict';

   React.render(<Home />, document.getElementById('app'));
});
