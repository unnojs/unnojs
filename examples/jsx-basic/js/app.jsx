// Home component
Unno.component('Home', ['$react', 'List'], function(React, Players) {
    'use strict';

    var Home = React.createClass({
        render: function() {
            return <div className='row'>
                <div className='well center'>
                    <span className='simple-text'>Simple Component</span>
                </div>
                <Players />
            </div>;
        }
    });

   return Home;
});
