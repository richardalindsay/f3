(function() {
  var f3;

  f3 = angular.module('f3', ['ngRoute', 'hljs']);

  f3.config([
    '$routeProvider', function($routeProvider) {
      return $routeProvider.when('/', {
        templateUrl: 'partials/blog-page',
        controller: 'blogController'
      }).when('/page/:page', {
        templateUrl: 'partials/blog-page',
        controller: 'blogController'
      }).when('/addPost', {
        templateUrl: 'partials/edit-post',
        controller: 'editPostController'
      }).when('/editPost/:_id', {
        templateUrl: 'partials/edit-post',
        controller: 'editPostController'
      });
    }
  ]);

  f3.controller('blogController', [
    '$scope', 'blogService', '$routeParams', '$location', function($scope, blogService, $routeParams, $location) {
      var page;
      page = parseInt($routeParams.page, 10) || 1;
      blogService.getBlog(page).then(function(response) {
        var rowCount;
        rowCount = response.data.data.pagination.rowCount;
        $scope.pagination = {};
        $scope.pagination.paginationList = blogService.calcPagination(rowCount, page);
        return $scope.posts = response.data.data.posts;
      });
      return $scope.goPage = function(page) {
        if (page) {
          return $location.path('page/' + page);
        }
      };
    }
  ]);

  f3.controller('editPostController', [
    '$scope', 'pageService', '$routeParams', '$location', function($scope, pageService, $routeParams, $location) {
      if ($routeParams._id) {
        pageService.getPost($routeParams._id).then(function(response) {
          $scope.form = response.data;
          return $scope.form.header = 'Edit';
        });
      } else {
        $scope.form = {};
        $scope.form.header = 'Add';
      }
      $scope.editControls = [
        {
          role: 'pre',
          content: '&lt;&gt'
        }, {
          role: 'undo',
          content: '<span class="glyphicon glyphicon-circle-arrow-left"></span>'
        }, {
          role: 'redo',
          content: '<span class="glyphicon glyphicon-repeat"></span>'
        }, {
          role: 'bold',
          content: '<span class="glyphicon glyphicon-bold"></span>'
        }, {
          role: 'italic',
          content: '<span class="glyphicon glyphicon-italic"></span>'
        }, {
          role: 'underline',
          content: '<u>A</u>'
        }, {
          role: 'strikethrough',
          content: '<strike>A</strike>'
        }, {
          role: 'justifyLeft',
          content: '<span class="glyphicon glyphicon-align-left"></span>'
        }, {
          role: 'justifyCenter',
          content: '<span class="glyphicon glyphicon-align-center"></span>'
        }, {
          role: 'justifyRight',
          content: '<span class="glyphicon glyphicon-align-right"></span>'
        }, {
          role: 'justifyFull',
          content: '<span class="glyphicon glyphicon-align-justify"></span>'
        }, {
          role: 'indent',
          content: '<span class="glyphicon glyphicon-indent-left"></span>'
        }, {
          role: 'outdent',
          content: '<span class="glyphicon glyphicon-indent-right"></span>'
        }, {
          role: 'insertUnorderedList',
          content: '<span class="glyphicon glyphicon-list"></span>'
        }, {
          role: 'insertOrderedList',
          content: '1<span class="glyphicon glyphicon-list"</span>'
        }, {
          role: 'h1',
          content: 'h<sup>1</sup>'
        }, {
          role: 'h2',
          content: 'h<sup>2</sup>'
        }, {
          role: 'p',
          content: 'p'
        }, {
          role: 'subscript',
          content: '<sub>A</sub>'
        }, {
          role: 'superscript',
          content: '<sup>A</sup>'
        }
      ];
      $scope.submit = function() {
        $scope.form.content = $scope.prepareHighlight($scope.form.content);
        if ($scope.form._id) {
          return pageService.putPost($scope.form._id, $scope.form.title, $scope.form.content).then(function() {
            return $location.path('/');
          });
        } else {
          return pageService.postPost($scope.form.title, $scope.form.content).then(function() {
            return $location.path('/');
          });
        }
      };
      $scope.deletePost = function() {
        return pageService.deletePost($scope.form._id).then(function() {
          return $location.path('/');
        });
      };
      $scope.formatText = function(role) {
        if (/h1|h2|p|pre/.test(role)) {
          return document.execCommand('formatBlock', false, role);
        } else {
          return document.execCommand(role, false, null);
        }
      };
      return $scope.prepareHighlight = function(text) {
        var regEx1, regEx2;
        if (/<pre>/.test(text)) {
          regEx1 = /<pre>(.*?)<\/pre>/g;
          regEx2 = /<br>/g;
          text = text.replace(regEx1, function(a) {
            return a.replace(regEx2, '\n');
          }).replace(/<pre>/g, '<div hljs no-escape><pre>').replace(/<\/pre>/g, '<\/pre><\/div>');
        }
        return text;
      };
    }
  ]);

  f3.factory('blogService', [
    '$http', function($http) {
      var calcPagination, getBlog;
      calcPagination = function(rowCount, page) {
        var i, pagination, totalPages, _i, _ref, _ref1;
        pagination = [];
        totalPages = Math.floor(rowCount / 10 + 1);
        if (page === 1) {
          pagination.push({
            text: '<',
            className: 'disabled'
          });
        } else {
          pagination.push({
            text: '<',
            link: page - 1
          });
        }
        for (i = _i = _ref = page - 4, _ref1 = page + 5; _ref <= _ref1 ? _i <= _ref1 : _i >= _ref1; i = _ref <= _ref1 ? ++_i : --_i) {
          if (i < page - 2 && totalPages - i <= 4 || i >= page - 2 && i > 0 && pagination.length <= 5) {
            if (i === page) {
              pagination.push({
                text: i,
                className: 'active'
              });
            } else {
              pagination.push({
                text: i,
                link: i
              });
            }
          }
        }
        if (page === totalPages) {
          pagination.push({
            text: '>',
            className: 'disabled'
          });
        } else {
          pagination.push({
            text: '>',
            link: page + 1
          });
        }
        return pagination;
      };
      getBlog = function(page) {
        var offset;
        offset = (page - 1) * 10;
        return $http.get('http://localhost:3000/api/blog/10/' + offset);
      };
      return {
        getBlog: getBlog,
        calcPagination: calcPagination
      };
    }
  ]);

  f3.factory('pageService', [
    '$http', function($http) {
      var deletePost, getPost, postPost, putPost;
      postPost = function(title, content) {
        return $http.post('http://localhost:3000/api/post/', {
          title: title,
          content: content
        });
      };
      getPost = function(_id) {
        return $http.get('http://localhost:3000/api/post/' + _id);
      };
      putPost = function(_id, title, content) {
        return $http.put('http://localhost:3000/api/post/' + _id, {
          title: title,
          content: content
        });
      };
      deletePost = function(_id) {
        return $http["delete"]('http://localhost:3000/api/post/' + _id);
      };
      return {
        postPost: postPost,
        getPost: getPost,
        putPost: putPost,
        deletePost: deletePost
      };
    }
  ]);

  f3.filter('trustAsHtml', [
    '$sce', function($sce) {
      return function(text) {
        return $sce.trustAsHtml(text);
      };
    }
  ]);

  f3.directive('contenteditable', function() {
    return {
      restrict: 'A',
      require: '?ngModel',
      link: function(scope, element, attrs, ngModel) {
        var readViewText;
        if (!ngModel) {
          return;
        }
        ngModel.$render = function() {
          return element.html(ngModel.$viewValue || '');
        };
        element.on('blur keyup change', function() {
          return scope.$apply(readViewText);
        });
        return readViewText = function() {
          var html;
          html = element.html();
          if (attrs.stripBr && html === '<br>') {
            html = '';
          }
          return ngModel.$setViewValue(html);
        };
      }
    };
  });

  f3.directive('dynamic', [
    '$compile', function($compile) {
      return {
        restrict: 'A',
        replace: true,
        link: function(scope, ele, attrs) {
          return scope.$watch(attrs.dynamic, function(html) {
            ele.html(html);
            return $compile(ele.contents())(scope);
          });
        }
      };
    }
  ]);

}).call(this);
