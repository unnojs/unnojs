require.config({
    baseUrl: 'js',
    urlArgs: "v=" +  (new Date()).getTime(),
    paths: {
        'unno': 'vendor/unno.min',
        'JSXTransformer': 'vendor/JSXTransformer',
        'text': 'vendor/text',
        'jsx': 'vendor/jsx'
    },
    jsx: {
        fileExtension: '.jsx'
    }
});

require(['unno', 'app/demo'], function(Unno) {
    'use strict';
    Unno.module('main', ['App'], function(App) {
        console.log('Unno Version:', Unno.VERSION);
        Unno.render(App({}), 'app');
    });
});
