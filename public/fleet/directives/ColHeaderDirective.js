app.directive('sortableColHeader',[function () {
	return {
        restrict: 'EA',
        // template: '',
        templateUrl: '/fleet/partials/ColHeader.html',
        replace: true,
        transclude: true,
        scope: {
        	sortType: '=',
        	sortReverse: '=',
        	onWhat: '@'
        },
        bindToController: true,
        controllerAs: 'chdir',
        controller: function(){
        	var chdir = this;

        	chdir.showChevron = function(reversed){
				if(chdir.sortType == chdir.onWhat && chdir.sortReverse == reversed){
					return true;
				}
				return false;
			}//showChevron
			chdir.changeSortType = function(){
				if(chdir.sortType == chdir.onWhat){
					chdir.sortReverse = !chdir.sortReverse;
				} else {
					chdir.sortReverse = false;
					chdir.sortType = chdir.onWhat;
				}
			}//changeSortType
        }
    };
}]);
