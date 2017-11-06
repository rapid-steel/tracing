let TracingController = (function() {

  return function( $scope, $stateParams, appService ) {
    $scope.mode = 'read';
    $scope.location = {};
    $scope.notFound = false;
    $scope.selected = $stateParams.id;
    $scope.loadingDoc = true;
    $scope.loadingView = true;

    this.$onInit = function() {

      appService.getDocument( $stateParams.id ).then( resp => {
        $scope.loadingDoc = false;
          resp
            ? $scope.selectedDoc = resp
            : $scope.notFound = true;
          $scope.$apply();
        });
    };

    $scope.setLocation = function( location ) {
      $scope.location = location;
      $scope.$broadcast('changeLocation');
    };

    $scope.getLocation = function() { return $scope.currentLocation() };

    $scope.$on('docViewLoaded', () => $scope.$broadcast('docLoaded') );
    $scope.$on('toolbarLoaded', () =>{
      $scope.loadingView = false;
      $scope.$apply();
    });
  }

})();