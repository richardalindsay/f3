var app = angular.module('app', ['ngRoute']);

app.config(function ($routeProvider) {
    $routeProvider
    .when('/', {
        templateUrl : 'partials/blog-page',
        controller  : 'blogController'
    })
    .when('/page/:page', {
        templateUrl : 'partials/blog-page',
        controller  : 'blogController'
    })
    .when('/addPost', {
        templateUrl : 'partials/edit-post',
        controller  : 'editPostController'
    })
    .when('/editPost/:_id', {
        templateUrl : 'partials/edit-post',
        controller  : 'editPostController'
    })
});

app.controller('blogController', function ($scope, blogService, $routeParams) {
    var page = parseInt($routeParams.page, 10) || 1;
    blogService.getBlog(page).then(function (response) {
        var rowCount = response.data.data.pagination.rowCount;
        $scope.pagination = {};
        $scope.pagination.paginationList = blogService.calcPagination(rowCount, page);
        $scope.posts = response.data.data.posts;
    });
});

app.controller('editPostController', function ($scope, pageService, $routeParams, $location) {
    if ($routeParams._id) {
        pageService.getPost($routeParams._id).then(function (response) {
            $scope.form = response.data;
        });
    } else {
        $scope.form = {};
    }

    $scope.submit = function() {
        if ($scope.form._id) {
            pageService.putPost($scope.form._id, $scope.form.title, $scope.form.content).then(function () {
                $location.path('/'); 
            });
        } else {
            pageService.postPost($scope.form.title, $scope.form.content).then(function() {
               $location.path('/'); 
            });
        }
    }

    $scope.deletePost = function() {
        pageService.deletePost($scope.form._id).then(function () {
           $location.path('/'); 
        });
    }
});

app.service('blogService', function ($http) {

    function calcPagination (rowCount, page) {
        var pagination, totalPages;
        pagination = [];
        totalPages = Math.floor(rowCount / 10 + 1);
        if (page === 1) {
            pagination.push({
                text: '<',
                page: '#',
                className: 'disabled'
            });
        } else {
            pagination.push({
                text: '<',
                page: page - 1
            });
        }
        for (var i = page - 4; i <= page + 5; i++) {
            if (i < page - 2 && totalPages - i <= 4 || i >= page - 2 && i > 0 && pagination.length <= 5) {
                if (i === page) {
                    pagination.push({
                        text: i,
                        page: i,
                        className: 'active'
                    });
                } else {
                    pagination.push({
                        text: i,
                        page: i
                    });
                }
            }
        }
        if (page === totalPages) {
            pagination.push({
                text: '>',
                page: '#',
                className: 'disabled'
            });
        } else {
            pagination.push({
                text: '>',
                page: page + 1
            });
        }
        return pagination;
    }

    function getBlog (page) {
        var offset = (page - 1) * 10;
        return $http.get('http://localhost:3000/api/blog/10/' + offset);
    }

    return {
        getBlog: getBlog,
        calcPagination: calcPagination
    };
});

app.service('pageService', function ($http) {

    function postPost (title, content) {
        return $http.post('http://localhost:3000/api/post/', { title: title, content: content });
    }

    function getPost (_id) {
        return $http.get('http://localhost:3000/api/post/' + _id);
    }

    function putPost (_id, title, content) {
        return $http.put('http://localhost:3000/api/post/' + _id, { title: title, content: content });
    }

    function deletePost (_id) {
        return $http.delete('http://localhost:3000/api/post/' + _id);
    }

    return {
        postPost: postPost,
        getPost: getPost,
        putPost: putPost,
        deletePost: deletePost
    };
});

app.filter('trustAsHtml', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
});

app.directive('contenteditable', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function (scope, element, attrs, ngModel) {
            if (!ngModel) return;
            ngModel.$render = function () {
                element.html(ngModel.$viewValue || '');
            };
            element.on('blur keyup change', function () {
                scope.$apply(readViewText);
            });
            function readViewText() {
                var html = element.html();
                if (attrs.stripBr && html == '<br>') {
                    html = '';
                }
                ngModel.$setViewValue(html);
            }
        }
    };
});