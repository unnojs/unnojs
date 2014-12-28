
// Home component
Unno.component('Home', ['$dom', 'List'], function(DOM, Players) {
   'use strict';

   var div = DOM.div,
       span = DOM.span;

   var Home = {
      render: function() {
         return div({ className:'row' },
            div({ className:'well center' },
               span({ className:'simple-text' }, 'Simple Component')
            ),
            Players({})
         )
      }
   };

   return Home;
});

// list component
Unno.component('List', ['$dom'], function(DOM) {
   'use strict';

   var div = DOM.div, ul = DOM.ul, li = DOM.li, h3 = DOM.h3;

   var List = {
      getInitialState: function() {
         return {
            items: ['Facebook', 'Github', 'Google', 'Instagram', 'Yahoo']
         };
      },

      render: function() {
         var _items = this.state.items.map(function(item, idx) {
            return li({ key:idx }, item);
         });

         return div({ className:'well' },
            h3(null, 'Big Players List'),
            ul(null, _items)
         )
      }
   };

   return List;
});

// main module
Unno.module('main', ['$react', 'Home'], function(React, App) {
   'use strict';

   React.render(App({}), document.getElementById('app'));
});
