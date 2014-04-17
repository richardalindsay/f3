$.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
  options.url = 'resources/php/control.php/' + options.url;
});

$.fn.serializeObject = function() {
  var o = {};
  var a = this.serializeArray();
  $.each(a, function() {
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(this.value || '');
      } else {
          o[this.name] = this.value || '';
      }
  });
  return o;
};

var config = {
	pageSize: 10
};

var Blog = Backbone.Model.extend({
	url: 'blog',
	parse: function(response) {
		return { pagination: response.pagination , posts: response.posts };
	},
});

var Pagination = Backbone.Model.extend({
	defaults: {
		'className': '',
		'element': 'a'
	},
});

var Post = Backbone.Model.extend({
	urlRoot: 'post',
	sync: function() {
		(arguments[0] === 'read') ?	this.set({ action: true }) : this.set({ action: false }) ;
		return Backbone.sync.apply(this, arguments);
	}
});

var PaginationList = Backbone.Collection.extend({ model: Pagination });

var Posts = Backbone.Collection.extend({ model: Post });

var ControlsView = Backbone.View.extend({
	className: 'controls',
	template: _.template($('#controls-template').html()),
	render: function() {
		this.$el.html(this.template());
		return this;
	}
});

var PaginationView = Backbone.View.extend({
	template: _.template($('#pagination-template').html()),
	render: function() {
		this.setElement(this.template(this.model.toJSON()));
		return this;
	}
});

var PaginationListView = Backbone.View.extend({
	tagName: 'ul',
	className: 'pagination pagination-sm',
	render: function(options) {
		this.$el.empty();
		this.page = options.page;
		this.collection = new PaginationList(this.calcPagination(options.rowCount));
		this.collection.each(function(pagination){
			var paginationView = new PaginationView({ model: pagination });
			this.$el.append(paginationView.render().el);
	    }, this);
		return this;
	},
	calcPagination: function(rowCount) {
		var pagination = [],
			page = this.page,
			totalPages = Math.floor(rowCount / config.pageSize + 1);
		(page === 1) ? pagination.push({ text: '<', page: '#', className: 'disabled' }) : pagination.push({ text: '<', page: page - 1 });
		_.each(_.range(page - 4, page + 5), function(i) {
			if (i < page - 2 && totalPages - i <= 4 || i >= page - 2 && i > 0 && pagination.length <= 5) {
				(i === page) ? pagination.push({ text: i, page: i, className: 'active' }) : pagination.push({ text: i, page: i });
			}
		});
		(page === totalPages) ? pagination.push({ text: '>', page: '#', className: 'disabled' }) : pagination.push({ text: '>', page: page + 1 });
		return pagination;
	}
});

var PostView = Backbone.View.extend({
	tagName: 'li',
	className: 'post',
	template: _.template($('#posts-template').html()),
	render: function(){
		this.$el.append(this.template(this.model.toJSON()));
		return this;
	}
});

var PostsView = Backbone.View.extend({
	tagName: 'ul',
	className: 'posts',
	render: function(options) {
		this.$el.empty();
		this.collection = new Posts(options.collection);
		this.collection.each(function(model){
			var postView = new PostView({ model: model });
			this.$el.append(postView.render().el);
	    }, this);
		return this;    
	}
});

var BlogView = Backbone.View.extend({
	el: '#main',
	fragment: $(document.createDocumentFragment()),
	model: new Blog(),
    initialize: function () {
        this.listenTo(this.model, 'sync', this.render);
    },
	subViews: {
		controlsView: new ControlsView(),
		paginationListView: new PaginationListView(),
		postsView: new PostsView()
	},
	render: function() {
		var $controls = $(this.subViews.controlsView.render().el);
		var $paginationTop = $(this.subViews.paginationListView.render({ page: this.model.get('page'), rowCount : this.model.get('pagination').rowCount }).el);
		var $posts = $(this.subViews.postsView.render({ collection: this.model.get('posts') }).el);
		var $paginationBottom = $paginationTop.clone();
		this.fragment.append($controls).append($paginationTop).append($posts).append($paginationBottom);
		this.$el.html(this.fragment);
		return this;
	}
});

var EditPostView = Backbone.View.extend({
	el: '#main',
	template: _.template($('#edit-post-template').html()),
	model: new Post(),
	events: {
		'submit .edit-post-form': 'savePost',
		'click .delete': 'deletePost'
	},
	initialize: function() {
	    this.listenTo(this.model, 'sync', this.designateAction);
	    this.listenTo(this.model, 'clear', this.renderEditPost);
	},
	designateAction: function(model) {
		(this.model.get('action')) ? this.renderEditPost(model) : router.navigate('', { trigger: true });
	},
	renderEditPost: function(model) {
		this.$el.html(this.template(model ? this.model.toJSON() : { id: null }));
	},
	savePost: function(event) {
		event.preventDefault();
		var postData = $(event.currentTarget).serializeObject();
		if (this.model.id) postData = $.extend({ id: this.model.id }, postData);
		this.model.save(postData);
	},
	deletePost: function(event) {
		event.preventDefault();
		this.model.destroy();
	}
});

var Router = Backbone.Router.extend({
	routes: {
		'': 'home',
		'page/:page': 'showPage',
		'addPost': 'addPost',
		'editPost/:id': 'editPost'
	},
	home: function() {
		blogView.model.set({ page: 1 });
		blogView.model.fetch({
			data: { pageSize: config.pageSize, offset: 0 }
		});
	},
	showPage: function(page) {
		var page = parseInt(page, 10),
			offset = (page - 1) * config.pageSize;
		blogView.model.set({ page: page });
		blogView.model.fetch({
			data: { pageSize: config.pageSize, offset: offset }
		});
	},
	addPost: function() {
		editPostView.model.clear();
		editPostView.model.trigger('clear');
	},
	editPost: function(id) {
		editPostView.model.set({ id: id });
		editPostView.model.fetch();
	}
});

var blogView = new BlogView();

var editPostView = new EditPostView();

var router = new Router();

Backbone.history.start();