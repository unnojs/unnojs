// todo header component
Unno.component('TodoHeader', ['$dom', '$addons'], function(DOM, Addons) {
	'use strict';

	var TodoHeader = {
		mixins: [Addons.LinkedStateMixin],

		getInitialState: function() {
			return { text:'' };
		},

		onKeyDown: function(e) {
			var val = '', item = {};
			if (e.keyCode == 13) {
				val = this.state.text;
				if (val) {
					item = { id:'', completed:false, title: val };
					Unno.trigger('TodoStore.add', item);
					this.setState({ text:'' });
				}
			}
		},

		render: function() {
			return DOM.header({},
				DOM.h1(null, 'todos'),
				DOM.input({ id:'new-todo',
					type:'text',
					placeholder:'What needs to be done?',
					autoFocus:true,
					valueLink: this.linkState('text'),
					onKeyDown: this.onKeyDown })
			)
		}
	};

	return TodoHeader;
});

// todo item component
Unno.component('TodoItem', ['$dom', '$addons'], function(DOM, Addons) {
	'use strict';

	var div = DOM.div, input = DOM.input,
		 li = DOM.li, label = DOM.label,
		 button = DOM.button;

	var TodoItem = {
		mixins: [Addons.LinkedStateMixin, Addons.ChangeStatePropertyMixin],

		getInitialState: function() {
			return { text:'', edit:false, completed:this.props.todo.completed };
		},

		onChange: function(e) {
			e.stopPropagation();
			var id = e.target.getAttribute('data-id');
			Unno.trigger('TodoStore.complete', id);
		},

		onRemove: function(e) {
			e.preventDefault();
			var id = e.target.getAttribute('data-id');
			Unno.trigger('TodoStore.remove', id);
		},

		onEdit: function(e) {
			e.preventDefault();
			if (this.state.completed) return;
			this.setState({ text: e.target.innerText, edit: true });
		},

		onKeyDown: function(e) {
			var val = '', item = {}, _id = '';
			if (e.keyCode == 13) {
				_id = e.target.getAttribute('data-id');
				val = this.state.text;
				if (val) {
					item = { id: _id, completed:false, title: val };
					Unno.trigger('TodoStore.update', item);
					this.setState({ text:'', edit:false });
				}
			} else if (e.keyCode == 27) {
				this.setState({ text:'', edit:false });
			}
		},

		render: function() {
			var item = this.props.todo,
				 _class = (item.completed ? 'completed' : '');

			if (this.state.edit)	_class += ' editing';

			return li({ className: _class },
				div({ className:'view' },
					input({ 'data-id': item.id, className: 'toggle', type:'checkbox', checked:item.completed, onChange: this.onChange }),
					label({ onDoubleClick: this.onEdit }, item.title),
					button({ 'data-id': item.id, className: 'destroy', onClick: this.onRemove })
				),
				input({ 'data-id': item.id, className:'edit', onKeyDown: this.onKeyDown, valueLink: this.linkState('text') })
			)
		}
	};

	return TodoItem;
});

	// todo list component
	Unno.component('TodoList', ['$dom', '$addons'], function(DOM, Addons) {
		'use strict';

		var section = DOM.section, ul = DOM.ul,
		    input = DOM.input,
			 label = DOM.label,
			 TodoItem = Unno.component('TodoItem');

		var TodoList = {

			getInitialState: function() {
				return { count: 0, data: [], edit:false };
			},

			handleStore: function(err, state) {
				if (err) { return; }
				this.setState(state);
			},

			onToggleAll: function(e) {
				e.stopPropagation();
				Unno.trigger('TodoStore.toggleAll', e.target.checked);
			},

			componentWillMount: function() {
				this.storeEventId = Unno.listen('TodoStoreChange', this.handleStore);
			},

			componentWillUnmount: function() {
				Unno.unlisten(this.storeEventId);
			},

			render: function() {
				var _style = { 'display': (this.state.count < 1 ? 'none':'') };

				var items = this.state.data.map(function(item, idx) {
					return TodoItem({ key: idx, todo: item });
				}.bind(this));

				return section({ id:'main', style: _style },
					input({ id:'toggle-all', type:'checkbox', onChange: this.onToggleAll }),
					label({ htmlFor:'toggle-all' }, 'Mark all as complete'),
					ul({ id:'todo-list' }, items)
				)
			}
		};

		return TodoList;
	});

	// todo footer component
	Unno.component('TodoFooter', ['$addons', '$dom'], function(Addons, DOM) {
		'use strict';

		var footer = DOM.footer, span = DOM.span,
		    strong = DOM.strong, button = DOM.button,
			 ul = DOM.ul, li = DOM.li, a = DOM.a;

		var TodoFooter = {
			mixins: [Addons.ChangeStatePropertyMixin],

			getInitialState: function() {
				return {
					filter:'all',
					count: 0,
					left: 0
				};
			},

			handleStore: function(err, state) {
				if (err) { return; }
				var left = 0;
				state.data.forEach(function(item) {
					if (item.completed == false) left++;
				});
				state.left = left;
				this.setState(state);
			},

			onClickClear: function(e) {
				e.preventDefault();
				Unno.trigger('TodoStore.clear', this.state.filter);
			},

			componentWillMount: function() {
				this.storeEventId = Unno.listen('TodoStoreChange', this.handleStore);
			},

			componentWillUnmount: function() {
				Unno.unlisten(this.storeEventId);
			},

			onFilter: function(e) {
				var filter = e.target.attributes['data-filter'].value;
				this.changeState('filter', filter);
				Unno.trigger('TodoStore.filter', filter);
			},

			render: function() {
				var _style = { 'display': (this.state.count < 1 ? 'none':'') },
				   completed = (this.state.count - this.state.left),
					text = (this.state.left > 1 ? ' items left' : ' item left'),
					filter = this.state.filter;

				return footer({ id:'footer', style: _style },
					span({ id:'todo-count'},
						strong(null, this.state.left),
						text
					),
					ul({ id: 'filters' },
						li(null, a({ className:(filter ==='all' ? 'selected':''), href:'#', 'data-filter':'all', onClick: this.onFilter }, 'All ')),
						li(null, a({ className:(filter ==='active' ? 'selected':''), href:'#', 'data-filter':'active', onClick: this.onFilter }, ' Active ')),
						li(null, a({ className:(filter ==='completed' ? 'selected':''), href:'#', 'data-filter':'completed', onClick: this.onFilter }, ' Completed'))
					),
					button({ id:'clear-completed', onClick: this.onClickClear }, 'Clear completed ('+ completed +')')
				)
			}
		};

		return TodoFooter;
	});

	// todo application
	Unno.component('TodoApp', ['$dom'], function(DOM) {
		'use strict';

		var section = DOM.section,
			 TodoHeader = Unno.component('TodoHeader'),
			 TodoList = Unno.component('TodoList'),
			 TodoFooter = Unno.component('TodoFooter');

		var TodoApp = {
			componentDidMount: function() {
				Unno.trigger('TodoStore.getTodos', 'all');
			},

			render: function() {
				return section({ id: 'todoapp' },
					TodoHeader({}),
					TodoList({}),
					TodoFooter({})
				)
			}
		};

		return TodoApp;
	});
