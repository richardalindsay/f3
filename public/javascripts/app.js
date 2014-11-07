var app = angular.module('app', []);

app.controller('postsController', function($scope, $http) {
    $http.get('http://localhost:3000/api/blog/10/0')
    .then(function(response) {
        $scope.posts = response.data.data.posts;
    });
});

app.filter('trustAsHtml', function($sce){
    return function(text) {
        return $sce.trustAsHtml(text);
    };
});