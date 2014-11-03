$.fn.serializeObject = ->
	o = {}
	a = @serializeArray()
	@find "[contenteditable]"
	.each ->
		a.push
			name: 
				$ @
				.attr("name")
			value: 
				$ @
				.html()
	$.each a, ->
		if o[@name] isnt `undefined`
			o[@name] = [o[@name]]  unless o[@name].push
			o[@name].push @value or ""
		else
			o[@name] = @value or ""
	return o

config =
	pageSize: 10

Blog = Backbone.Model.extend
	url: ->
		offset = (@get('page') - 1) * config.pageSize
		return 'blog/' + config.pageSize + '/' + offset

	parse: (response) ->
		return pagination: response.data.pagination , posts: response.data.posts

Pagination = Backbone.Model.extend
	defaults:
		'className': ''
		'element': 'a'

Post = Backbone.Model.extend
	urlRoot: 'post'
	idAttribute: '_id'

	sync: () ->
		@set id : @id
		if arguments[0] is 'read' then @set action: true else @set action: false
		return Backbone.sync.apply @, arguments

	initialize: () ->
		@set id : @id

PaginationList = Backbone.Collection.extend model: Pagination

Posts = Backbone.Collection.extend model: Post

ControlsView = Backbone.View.extend
	className: 'controls'
	template: _.template $('#controls-template').html()

	render: () ->
		@$el.html @template()
		return @

PaginationView = Backbone.View.extend
	template: _.template $('#pagination-template').html()

	render: () ->
		@setElement @template @model.attributes;
		return @

PaginationListView = Backbone.View.extend
	tagName: 'ul'
	className: 'pagination pagination-sm'
	collection: new PaginationList()

	initialize : (options) ->
 		@options = options

	render: () ->
		@$el.empty()
		@collection.reset @calcPagination @options.rowCount
		@collection.each (model) ->
			@modelView = new PaginationView model: model
			@$el.append @modelView.render().el
		, @
		return @

	calcPagination: (rowCount) ->
		pagination = []
		page = @options.page
		totalPages = Math.floor rowCount / config.pageSize + 1

		if page is 1
			pagination.push text: '<', page: '#', className: 'disabled'
		else
			pagination.push text: '<', page: page - 1

		_.each _.range(page - 4, page + 5), (i) ->
			if i < page - 2 and totalPages - i <= 4 or i >= page - 2 and i > 0 and pagination.length <= 5
				if i is page
					pagination.push text: i, page: i, className: 'active'
				else
					pagination.push text: i, page: i

		if page is totalPages
			pagination.push text: '>', page: '#', className: 'disabled'
		else
			pagination.push text: '>', page: page + 1
		
		return pagination

PostView = Backbone.View.extend
	tagName: 'div'
	className: 'blog-post'
	template: _.template $('#posts-template').html()

	render: () ->
		@$el.html @template @model.attributes
		return @

PostsView = Backbone.View.extend
	className: 'blog-main'

	render: () ->
		@$el.empty()
		@collection.each (model) ->
			@modelView = new PostView model: model
			@$el.append @modelView.render().el
		, @
		return @

BlogView = Backbone.View.extend
	el: '#main'
	fragment: $ document.createDocumentFragment()
	model: new Blog()
	subViews:
		controlsView: new ControlsView()
		paginationListView: new PaginationListView()
		postsView: new PostsView()

	initialize: () ->
        @listenTo @model, 'sync', @render

	render: () ->
		@subViews.controlsView = new ControlsView()
		@subViews.paginationListView = new PaginationListView
			page: @model.get 'page'
			rowCount: @model.get('pagination').rowCount
		@subViews.postsView = new PostsView collection: new Posts @model.get 'posts'
		@subViews.$controls = $ @subViews.controlsView.render().el
		@subViews.$paginationTop = $ @subViews.paginationListView.render().el
		@subViews.$posts = $ @subViews.postsView.render().el
		hljs.highlightBlock e for e in $ 'pre', @subViews.$posts
		@subViews.$paginationBottom = @subViews.$paginationTop.clone()
		@fragment.append @subViews.$controls
		.append @subViews.$paginationTop
		.append @subViews.$posts
		.append @subViews.$paginationBottom
		@$el.html @fragment
		return @

EditPostView = Backbone.View.extend
	el: '#main'
	template: _.template $('#edit-post-template').html()
	model: new Post()
	events:
		'submit .edit-post-form': 'savePost'
		'click .delete': 'deletePost'
		'click .editControls button': 'editContent'

	initialize: ->
	    @listenTo @model, 'sync', @designateAction
	    @listenTo @model, 'clear', @renderEditPost

	designateAction: (model) ->
		if @model.get 'action' then @renderEditPost model else router.navigate '', trigger: true

	renderEditPost: (model) ->
		@$el.html @template if model then @model.attributes else id: null

	savePost: (event) ->
		event.preventDefault()
		postData = $ event.currentTarget
		.serializeObject()
		if @model.id
			postData = $.extend
				id: @model.id
				postData
		@model.save postData

	deletePost: (event) ->
		event.preventDefault()
		@model.destroy()

	editContent: (event) ->
		event.preventDefault()
		role = $ event.currentTarget
		.closest '[data-role]'
		.data 'role'
		if /h1|h2|p|pre/.test role
			document.execCommand 'formatBlock', false, role
		else
			document.execCommand role, false, null

Router = Backbone.Router.extend
	routes:
		'': 'home'
		'page/:page': 'showPage'
		'addPost': 'addPost'
		'editPost/:id': 'editPost'

	home: ->
		blogView.model.set
			page : 1
		blogView.model.fetch()

	showPage: (page) ->
		blogView.model.set
			page : parseInt page, 10
		blogView.model.fetch()

	addPost: ->
		editPostView.model.clear()
		editPostView.model.trigger 'clear'

	editPost: (id) ->
		editPostView.model.set
			_id : id
		editPostView.model.fetch()

blogView = new BlogView()

editPostView = new EditPostView()

router = new Router()

$ ->
	init()

init = ->
	Backbone.history.start()