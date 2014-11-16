f3 = angular.module 'f3', ['ngRoute', 'hljs']

f3.config ['$routeProvider', ($routeProvider) ->
    
    $routeProvider
    .when '/',
        templateUrl : 'partials/blog-page'
        controller  : 'blogController'

    .when '/page/:page',
        templateUrl : 'partials/blog-page'
        controller  : 'blogController'

    .when '/addPost',
        templateUrl : 'partials/edit-post'
        controller  : 'editPostController'

    .when '/editPost/:_id',
        templateUrl : 'partials/edit-post'
        controller  : 'editPostController'
]

f3.controller 'blogController', ['$scope', 'blogService', '$routeParams', '$location', ($scope, blogService, $routeParams, $location) ->

    page = parseInt($routeParams.page, 10) or 1
    blogService.getBlog page
    .then (response) ->
        rowCount = response.data.data.pagination.rowCount
        $scope.pagination = {}
        $scope.pagination.paginationList = blogService.calcPagination rowCount, page
        $scope.posts = response.data.data.posts

    $scope.goPage = (page) ->
        if page then $location.path 'page/' + page
]

f3.controller 'editPostController', ['$scope', 'pageService', '$routeParams', '$location', ($scope, pageService, $routeParams, $location) ->
    
    if $routeParams._id
        pageService.getPost $routeParams._id
        .then (response) ->
            $scope.form = response.data
            $scope.form.header = 'Edit'
    else
        $scope.form = {}
        $scope.form.header = 'Add'

    $scope.editControls = [
        role: 'pre', content: '&lt;&gt'
    ,
        role: 'undo', content: '<span class="glyphicon glyphicon-circle-arrow-left"></span>'
    ,
        role: 'redo', content: '<span class="glyphicon glyphicon-repeat"></span>'
    ,
        role: 'bold', content: '<span class="glyphicon glyphicon-bold"></span>'
    ,
        role: 'italic', content: '<span class="glyphicon glyphicon-italic"></span>'
    ,
        role: 'underline', content: '<u>A</u>'
    ,
        role: 'strikethrough', content: '<strike>A</strike>'
    ,
        role: 'justifyLeft', content: '<span class="glyphicon glyphicon-align-left"></span>'
    ,
        role: 'justifyCenter', content: '<span class="glyphicon glyphicon-align-center"></span>'
    ,
        role: 'justifyRight', content: '<span class="glyphicon glyphicon-align-right"></span>'
    ,
        role: 'justifyFull', content: '<span class="glyphicon glyphicon-align-justify"></span>'
    ,
        role: 'indent', content: '<span class="glyphicon glyphicon-indent-left"></span>'
    ,
        role: 'outdent', content: '<span class="glyphicon glyphicon-indent-right"></span>'
    ,
        role: 'insertUnorderedList', content: '<span class="glyphicon glyphicon-list"></span>'
    ,
        role: 'insertOrderedList', content: '1<span class="glyphicon glyphicon-list"</span>'
    ,
        role: 'h1', content: 'h<sup>1</sup>'
    ,
        role: 'h2', content: 'h<sup>2</sup>'
    ,
        role: 'p', content: 'p'
    ,
        role: 'subscript', content: '<sub>A</sub>'
    ,
        role: 'superscript', content: '<sup>A</sup>'
    ]

    $scope.submit = ->
        $scope.form.content = $scope.prepareHighlight $scope.form.content
        if $scope.form._id
            pageService.putPost $scope.form._id, $scope.form.title, $scope.form.content
            .then ->
                $location.path '/'
        else
            pageService.postPost $scope.form.title, $scope.form.content
            .then ->
               $location.path '/'

    $scope.deletePost = ->
        pageService.deletePost $scope.form._id
        .then () ->
           $location.path '/' 

    $scope.formatText = (role) ->
        if /h1|h2|p|pre/.test role
            document.execCommand 'formatBlock', false, role
        else
            document.execCommand role, false, null

    $scope.prepareHighlight = (text) ->
        if /<pre>/.test text
            text = text
            .replace /<pre>/g, '<div hljs no-escape>'
            .replace /<\/pre>/g, '</div>'
            .replace /<br>/g, '\n'
        text

]

f3.factory 'blogService', ['$http', ($http) ->

    calcPagination = (rowCount, page) ->
        pagination = []
        totalPages = Math.floor rowCount / 10 + 1
        if page is 1
            pagination.push text: '<', className: 'disabled'
        else
            pagination.push text: '<', link: page - 1

        for i in [page - 4 .. page + 5]
            if i < page - 2 and totalPages - i <= 4 or i >= page - 2 and i > 0 and pagination.length <= 5
                if i is page
                    pagination.push text: i, className: 'active'
                else
                    pagination.push text: i, link: i

        if page is totalPages
            pagination.push text: '>', className: 'disabled'
       	else
            pagination.push text: '>', link: page + 1

        pagination

    getBlog = (page) ->
       	offset = (page - 1) * 10;
        $http.get 'http://localhost:3000/api/blog/10/' + offset

    getBlog: getBlog
    calcPagination: calcPagination
]

f3.factory 'pageService', ['$http', ($http) ->

    postPost = (title, content) ->
        $http.post 'http://localhost:3000/api/post/', title: title, content: content

    getPost = (_id) ->
        $http.get 'http://localhost:3000/api/post/' + _id

    putPost = (_id, title, content) ->
        $http.put 'http://localhost:3000/api/post/' + _id, title: title, content: content

    deletePost = (_id) ->
        $http.delete 'http://localhost:3000/api/post/' + _id

    postPost: postPost
    getPost: getPost
    putPost: putPost
    deletePost: deletePost
]

f3.filter 'trustAsHtml', ['$sce', ($sce) ->
    (text) ->
        $sce.trustAsHtml text
]

f3.directive 'contenteditable', () ->
    restrict: 'A'
    require: '?ngModel'
    link: (scope, element, attrs, ngModel) ->
        if not ngModel then return
        ngModel.$render = () ->
            element.html ngModel.$viewValue or ''
        element.on 'blur keyup change', () ->
            scope.$apply readViewText
        readViewText = ->
            html = element.html()
            if attrs.stripBr and html is '<br>'
                html = ''
            ngModel.$setViewValue html

f3.directive 'dynamic', ($compile) ->
    restrict: 'A'
    replace: true
    link: (scope, ele, attrs) ->
        scope.$watch attrs.dynamic, (html) ->
            ele.html html
            $compile(ele.contents())(scope)