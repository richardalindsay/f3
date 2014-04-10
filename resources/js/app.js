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
		return { pagination: response.pagination , 'posts': response.posts };
	}
});

var Pagination = Backbone.Model.extend({
	defaults: {
		'className': '',
		'element': 'a'
	}
});

var Post = Backbone.Model.extend({
	urlRoot: 'post'
})

var PaginationList = Backbone.Collection.extend({ model: Pagination });

var Posts = Backbone.Collection.extend({ model: Post });

var ControlsView = Backbone.View.extend({
	className: 'controls',
	template: _.template($('#controls-template').html()),
	render: function() {
		this.$el.empty();
		this.$el.append(this.template());
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
		this.currentPage = options.currentPage;
		this.collection = new PaginationList(this.calcPagination(options.rowCount));
		this.collection.each(function(pagination){
			var paginationView = new PaginationView({ model: pagination });
			this.$el.append(paginationView.render().el);
	    }, this);
		return this;
	},
	calcPagination: function(rowCount) {
		var pagination = [],
			currentPage = this.currentPage,
			totalPages = Math.floor(rowCount / config.pageSize + 1);
			(currentPage === 1) ? pagination.push({ text: '<', page: '#', className: 'disabled' }) : pagination.push({ text: '<', page: currentPage - 1 });
			_.each(_.range(currentPage - 4, currentPage + 5), function(i) {
				if (i < currentPage - 2 && totalPages - i <= 4 || i >= currentPage - 2 && i > 0 && pagination.length <= 5) {
					(i === currentPage) ? pagination.push({ text: i, page: i, className: 'active' }) : pagination.push({ text: i, page: i });
				}
			});
			(currentPage === totalPages) ? pagination.push({ text: '>', page: '#', className: 'disabled' }) : pagination.push({ text: '>', page: currentPage + 1 });
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
		this.collection.each(function(post){
			var postView = new PostView({ model: post });
			this.$el.append(postView.render().el);
	    }, this);
		return this;    
	}
});

var BlogView = Backbone.View.extend({
	el: '#main',
	fragment: $(document.createDocumentFragment()),
	model: new Blog(),
	subViews: {
		controlsView: new ControlsView(),
		paginationListView: new PaginationListView(),
		postsView: new PostsView()
	},
	initialize: function() {
	    _.bindAll(this, 'renderSuccess');
	},
	render: function(options) {
		this.$el.empty();
		this.currentPage = options.page;
		this.offset = (this.currentPage - 1) * config.pageSize;
		this.model.fetch({
			data: { pageSize: config.pageSize, offset: this.offset },
			success: this.renderSuccess
		})
		return this;
	},
	renderSuccess: function() {
		var $controls = $(this.subViews.controlsView.render().el);
		var $paginationTop = $(this.subViews.paginationListView.render({ currentPage: this.currentPage, rowCount : this.model.get('pagination').rowCount }).el);
		var $posts = $(this.subViews.postsView.render({ collection: this.model.get('posts') }).el);
		var $paginationBottom = $paginationTop.clone();
		this.fragment.append($controls);
		this.fragment.append($paginationTop);
		this.fragment.append($posts);
		this.fragment.append($paginationBottom);
		this.$el.append(this.fragment);
	}
});

var EditPostView = Backbone.View.extend({
	el: '#main',
	template: _.template($('#edit-post-template').html()),
	post: new Post(),
	events: {
		'submit .edit-post-form': 'savePost',
		'click .delete': 'deletePost'
	},
	initialize: function() {
	    _.bindAll(this, 'renderSuccess');
	},
	render: function(options) {
		if (options.id) {
			this.post = new Post({ id: options.id });
			this.post.fetch({ success: this.renderSuccess });
		} else {
			this.post.clear(); 
			this.$el.html(this.template({ id: null }));
		}
	},
	renderSuccess: function(post) {
		this.$el.html(this.template(post.toJSON()));
	},
	savePost: function(event) {
		var postData = $(event.currentTarget).serializeObject();
		if (this.post.id) postData = $.extend({ id: this.post.id }, postData);
		this.post = new Post();
		this.post.save(postData, { success: this.navigateHome });
		event.preventDefault();
	},
	deletePost: function(event) {
		this.post.destroy({ success: this.navigateHome });
		event.preventDefault();
	},
	navigateHome: function() {
		router.navigate('', { trigger: true });
	}
});

var Router = Backbone.Router.extend({
	routes: {
		'': 'home',
		'page/:page': 'showPage',
		'addPost': 'editPost',
		'editPost/:id': 'editPost'
	}
});

var blogView = new BlogView();

var editPostView = new EditPostView();

var router = new Router();

router.on('route:home', function() {
	blogView.render({ page: 1 });
});

router.on('route:showPage', function(page) {
	blogView.render({ page: parseInt(page, 10) });
});

router.on('route:editPost', function(id) {
	editPostView.render({ id: id });
});

Backbone.history.start();