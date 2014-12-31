Unno.store('TodoStore', ['$storage'], function(storage) {
    'use strict';

     function S4() {
        return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
     }

     var TodoStore = {
        url:'',

        init: function() {
            var todos = JSON.parse(storage.get('todos'));
            if (!todos) {
                todos = [];
                storage.add('todos', JSON.stringify(todos));
            }
        },

        newId: function() {
            return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
        },

         updateList: function(collection) {
            storage.add('todos', JSON.stringify(collection));
         },

         getTodos: function(param) {
             var todos = JSON.parse(storage.get('todos'));
             if (param === 'all') {
                this.setData(todos);
             } else if (param === 'active') {
                this.setData(todos.filter(function(item) {
                   return (item.completed == false);
                }));
             } else {
                this.setData(todos.filter(function(item) {
                   return (item.completed == true);
                }));
             }
             this.notify();
         },

        complete: function(id) {
            var todos = JSON.parse(storage.get('todos'));
            todos.forEach(function(todo) {
                if (todo.id === id) todo.completed = !todo.completed;
            });

            this.updateList(todos);
            this.getTodos('all');
        },

        add: function(item) {
            var todos = JSON.parse(storage.get('todos'));
            item.id = this.newId();
            todos.push(item);
            this.updateList(todos);
            this.getTodos('all');
        },

        toggleAll: function(value) {
            var todos = JSON.parse(storage.get('todos'));
            todos = todos.map(function(item) {
                item.completed = value;
                return item;
            });
            this.updateList(todos);
            this.getTodos('all');
        },

        remove: function(id) {
            var todos = JSON.parse(storage.get('todos')),
                index = -1;

            todos.filter(function(item, idx) {
                if (item.id === id) index = idx;
            });

            if (index == -1) return;
            todos.splice(index, 1);
            this.updateList(todos);
            this.getTodos('all');
        },

        clear: function(filter) {
            var todos = JSON.parse(storage.get('todos'));
            todos = todos.filter(function(item, idx) {
                return (item.completed == false);
            });
            this.updateList(todos);
            this.getTodos(filter);
        }
    };
    return TodoStore;
});
