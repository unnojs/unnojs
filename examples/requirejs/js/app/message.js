/**global define */
define(function(require) {
    'use strict';

    var Unno = require('unno');

    Unno.component('Message', ['$dom'], function(DOM) {
        var div = DOM.div, h2 = DOM.h2;

        var Message = {
            render: function() {
                return div(null,
                    h2(null, 'Unno Version: ' + Unno.VERSION)
                );
            }
        };

        return Message;
    });

});
