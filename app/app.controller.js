let appController = (function() {

  return function ($scope, appService) {

    $scope.documentsList = [];
    $scope.loadingList = true;

    this.$onInit = () => {
      appService.loadList().then( resp => {
        $scope.loadingList = false;
        $scope.documentsList = appService.getList();
      });
    };

    $scope.$on('changeList', () =>
      $scope.documentsList = appService.getList()
    )
  }

})();