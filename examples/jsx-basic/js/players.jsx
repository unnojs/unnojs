// list component
Unno.component('List', ['$react'], function(React) {
   'use strict';

    var List = React.createClass({
        getInitialState: function() {
            return {
                items: ['Facebook', 'Github', 'Google', 'Instagram', 'Yahoo']
            };
        },

        render: function() {
            var items = this.state.items.map(function(item, idx) {
                return <li key={idx}>{item}</li>;
            });

            return (<div className='well'>
                <h3>Big Players List</h3>
                <ul> {items} </ul>
            </div>);
        }
    });

    return List;
});
