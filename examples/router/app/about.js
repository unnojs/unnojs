Unno.component('About', ['$dom'], function(D) {

   var text = 'Lorem ipsum dolor sit amet, consul albucius partiendo eam eu. Eam an ponderum recusabo. Choro nonumes fastidii eu nam, ei quod utroque vix, graeco pertinax imperdiet mei an. Alia similique ex nec, no quot suscipiantur nec, ea quo causae sanctus. Id omnesque signiferumque eum, rebum accusam cu usu, eu elit errem salutatus cum.';
   var About = {
      render: function() {
         return D.div({},
            D.h3({}, 'About'),
            D.p({}, text)
         )
      }
   };

   return About;
});
