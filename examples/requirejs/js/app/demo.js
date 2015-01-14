/**global define */
define(function(require) {
    'use strict';

    require('app/message');
    var Unno = require('unno');

    Unno.component('App', ['$dom', 'Message'], function(DOM, Message) {

        var App = {
            render: function() {
                return DOM.div(null,
                    DOM.h2({}, 'Unno as an AMD module'),
                    Message({})
                );
            }
        };

        return App;
    });

});
