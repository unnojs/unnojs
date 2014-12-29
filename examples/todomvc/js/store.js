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

        getTodos: function() {
            this.setData(JSON.parse(storage.get('todos')));
            this.notify();
        },

        complete: function(id) {
            var todos = JSON.parse(storage.get('todos'));
            todos.forEach(function(todo) {
                if (todo.id === id) todo.completed = !todo.completed;
            });

            this.updateList(todos);
            this.getTodos();
        },

        add: function(item) {
            var todos = JSON.parse(storage.get('todos'));
            item.id = this.newId();
            todos.push(item);
            this.updateList(todos);
            this.getTodos();
        },

        toggleAll: function(value) {
            console.log(value);
            var todos = JSON.parse(storage.get('todos'));
            todos = todos.map(function(item) {
                item.completed = value;
                return item;
            });
            console.log(todos);
            //this.updateList(todos);
            //this.getTodos();
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
            this.getTodos();
        },

        clear: function() {
            var todos = JSON.parse(storage.get('todos')),
                filtered = [], index = -1;

            filtered = todos.filter(function(item, idx) {
                return (item.completed == true);
            });

            filtered.forEach(function(item) {
                index = -1;
                todos.forEach(function(todo, idx) {
                    if (todo.id === item.id) {
                        index = idx;
                        return;
                    }
                });

                if (index > -1) {
                    todos.splice(index, 1);
                }
            });

            this.updateList(todos);
            this.getTodos();
        }

    };

    return TodoStore;
});
