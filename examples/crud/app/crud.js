/**
 * Application (entry point)
 */
Unno.component('App', ['$dom', 'ContactTable', 'ContactForm', 'Footer'],
function(D, table, form, footer) {
   'use strict';

   var div = D.div;

   var App = {
      render: function() {
         return div({},
            D.nav({className:'navbar navbar-default navbar-fixed-top'},
               div({className:'container'},
                  div({className:'navbar-header'},
                     D.img({className:'icon-brand', src:'../assets/img/unno_150.png'}),
                     D.a({className:'navbar-brand', href:'#'},
                        D.span({}, 'CRUD')
                     )
                  )
               )
            ),
            div({className:'container', style:{'padding':'60px 0px 0px'}},
               form({}),
               D.hr({}),
               table({})
            ),
            D.br({}),
            footer({})
         )
      }
   };

   return App;
});

/**
 * Footer page component
 */
Unno.component('Footer', ['$dom'], function(D) {

   var Footer = {
      render: function() {
         return D.footer({className:'footer'},
            D.div({className:'container'},
               D.p({className:'text-muted'}, 'Powered by UnnoJS Team')
            )
         )
      }
   };

   return Footer;
});

/**
 * Contact Form
 */
Unno.component('ContactForm', ['$dom', '$addons'], function(D, addons) {
   var div = D.div, label = D.label, input = D.input, button = D.button;

   var ContactForm = {
      getInitialState: function() {
         return { name:'', email:'' };
      },

      mixins: [addons.LinkedStateMixin],

      handleSave: function(e) {
         e.stopPropagation();
         Unno.trigger('ContactStore.add', this.state);
         this.setState({ name:'', email:'' });
      },

      handleCancel: function(e) {
         e.stopPropagation();
         this.setState({ name:'', email:'' });
      },

      render: function() {
         return D.form({className:'form-horizontal'},
            D.br({}),
            div({className:'form-group'},
               label({ className:'col-sm-2 control-label'}, 'Name:'),
               div({className:'col-sm-10'},
                  input({ className:'form-control', type:'text', maxLength:'35', valueLink: this.linkState('name') })
               )
            ),
            div({className:'form-group'},
               label({ className:'col-sm-2 control-label'}, 'E-mail:'),
               div({className:'col-sm-10'},
                  input({ className:'form-control', type:'text', maxLength:'80', valueLink: this.linkState('email') })
               )
            ),
            div({className:'form-group'},
               div({className:'col-sm-offset-2 col-sm-10'},
                  button({ type:'button', className:'btn btn-success', onClick: this.handleSave}, 'Save'),
                  String.fromCharCode(160),
                  button({ type:'button', className:'btn btn-default', onClick: this.handleCancel}, 'Cancel')
               )
            )
         )
      }
   };

   return ContactForm;
});

/**
 * Contact Table
 */
Unno.component('ContactTable', ['$dom'], function(D) {

   var TableHeader = [
      D.th({key:1, width:'25%'}, '#'),
      D.th({key:2}, 'Name'),
      D.th({key:3}, 'E-mail'),
      D.th({key:4, width:'10%'}, '')
   ];

   var ContactTable = {
      getInitialState: function() {
         return { data:[] };
      },

      componentWillMount: function() {
         this.eventId = Unno.listen('ContactStoreChange', this.handleUpdate)
      },

      componentWillUnmount: function() {
         Unno.unlisten(this.eventId);
      },

      componentDidMount: function() {
         Unno.trigger('ContactStore.list');
      },

      handleUpdate: function(err, list) {
         if (err) {
            console.log(err); return;
         }
         this.setState({ data: list });
      },

      handleRemove: function(e) {
         e.stopPropagation();
         var val = e.target.getAttribute('data-id');
         if (confirm('Are you wish remove this contact ?')) {
            Unno.trigger('ContactStore.remove', val);
         }
      },

      render: function() {
         var self = this, rows;

         rows = this.state.data.map(function(item, idx) {
            return D.tr({key:idx},
               D.td({}, item.id),
               D.td({}, item.name),
               D.td({}, item.email),
               D.td({},
                  D.button({'data-id': item.id, className:'btn btn-danger glyphicon glyphicon-remove', onClick:self.handleRemove}, 'Remove')
               )
            );
         });

         return D.table({className:'table table-striped'},
            D.thead({}, D.tr({}, TableHeader)),
            D.tbody({}, rows),
            D.tfoot({},
               D.tr({}, D.td({colSpan:'4'}, 'Total: ' + rows.length))
            )
         )
      }
   };

   return ContactTable;
});
