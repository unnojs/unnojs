	// todo header component
	Unno.component('TodoHeader', ['$dom', '$addons'], function(DOM, Addons) {
		'use strict';

		var header = DOM.header,
			 input = DOM.input;

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
				return header({},
					DOM.h1(null, 'todos'),
					input({ id:'new-todo',
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

	// todo list component
	Unno.component('TodoList', ['$dom', 'TodoItem'], function(DOM, Todo) {
		'use strict';

		var section = DOM.section, ul = DOM.ul,
		    input = DOM.input, label = DOM.label

		var TodoList = {
			getInitialState: function() {
				return { count: 0, todos: [] };
			},

			handleStore: function(err, data) {
				if (err) { return; }
				this.setState({ count: data.length, todos: data });
			},

			onToggleAll: function(e) {
				e.stopPropagation();
				Unno.trigger('TodoStore.toggleAll', !!e.target.checked);
			},

			componentWillMount: function() {
				this.storeEventId = Unno.listen('TodoStoreChange', this.handleStore);
			},

			componentWillUnmount: function() {
				Unno.unlisten(this.storeEventId);
			},

			render: function() {
				var _style = { 'display': (this.state.count < 1 ? 'none':'') };

				var items = this.state.todos.map(function(item, idx) {
					return Todo({ key: idx, todo: item })
				});

				return section({ id:'main', style: _style },
					input({ id:'toggle-all', type:'checkbox', onChange: this.onToggleAll }),
					label({ htmlFor:'toggle-all' }, 'Mark all as complete'),
					ul({ id:'todo-list' }, items)
				)
			}
		};

		return TodoList;
	});

	// todo item component
	Unno.component('TodoItem', ['$dom'], function(DOM) {
		'use strict';

		var div = DOM.div, input = DOM.input,
			 li = DOM.li, label = DOM.label,
			 button = DOM.button;

		var TodoItem = {
			onChange: function(e) {
				e.stopPropagation();
				var id = e.target.getAttribute('data-id');
				Unno.trigger('TodoStore.complete', id);
			},

			onClick: function(e) {
				e.preventDefault();
				var id = e.target.getAttribute('data-id');
				Unno.trigger('TodoStore.remove', id);
			},

			render: function() {
				var item = this.props.todo;
				return li({ className: (item.completed ? 'completed' : '') },
					div({ className:'view' },
						input({ 'data-id': item.id, className: 'toggle', type:'checkbox', checked:item.completed, onChange: this.onChange }),
						label(null, item.title),
						button({ 'data-id': item.id, className: 'destroy', onClick: this.onClick })
					),
					input({ className:'edit' })
				)
			}
		};

		return TodoItem;
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

			handleStore: function(err, data) {
				if (err) { return; }
				var _left = data.filter(function(item) {
					if (!item.completed) return item;
				});
				this.setState({ count: data.length, left: _left.length });
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
				Unno.trigger('TodoStore.getTodos', filter);
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
	Unno.component('TodoApp', [
		'$dom', 'TodoHeader', 'TodoList', 'TodoFooter'
	], function(DOM, TodoHeader, TodoList, TodoFooter) {
		'use strict';

		var section = DOM.section;

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
