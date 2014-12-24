Unno.store('ContactStore', ['$storage'], function(storage) {

   function S4() {
      return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
   }

   var ContactStore = {
      url:'',
      getId: function() {
         return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0,3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
      },

      getCollection: function() {
         return (JSON.parse(storage.get('contacts')) || []);
      },

      updateCollection: function(collection) {
         storage.add('contacts', JSON.stringify(collection));
      },

      add: function(model) {
         var id = this.getId(),
             collection = this.getCollection();
         model.id = this.getId();
         collection.push(model);
         this.updateCollection(collection);
         this.list();
      },

      remove: function(id) {
         var collection = this.getCollection(),
             filtered, index = -1;

         filtered = collection.filter(function(model, idx) {
            if (model.id === id) index = idx;
         });

         if (index > -1) {
            collection.splice(index, 1);
            this.updateCollection(collection);
            this.list();
         }
      },

      list: function() {
         var collection = this.getCollection();
         this.setData(collection);
         this.notify();
      }

   };

   return ContactStore;
});
