let DocumentsListController = (function() {

   return function ($scope, appService) {

      let extensions = [ 'pdf', 'jpg', 'jpeg', 'png', 'gif'];

      $scope.newUrl = '';
      $scope.incorrectExtension = false;

      $scope.checkExtension = function( newUrl ) {
         if( newUrl === '' ||  extensions.indexOf( newUrl.split('.').pop().toLowerCase() ) !== - 1 )
            $scope.incorrectExtension = false;
      };

     $scope.addDocument = function(newUrl ) {
       if ( extensions.indexOf( newUrl.split('.').pop().toLowerCase() ) !== - 1 ) {
         let newDoc = {
           url: newUrl,
           plots: []
         };
         appService.addDocument( newDoc ).then( resp => {
           $scope.$emit('changeList');
           $scope.newUrl = '';
         });
       } else {
         $scope.incorrectExtension = true;
       }
     };

     $scope.deleteDocument = function ( index ) {
       appService.deleteDocument( index ).then( resp => {
         $scope.$emit('changeList');
       });
     };


   };


}());