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

var Post = Backbone.Model.extend({
	urlRoot: 'posts'
})

var Posts = Backbone.Collection.extend({
	url: 'posts',
	pageSize: 10,
	offset: 0,
	currentPage: 1,
	totalPages: 0,
	pagination: [],
	parse: function(response) {
		this.pagination = this.calcPagination(response.info.rowCount);
		return response.posts;
	},
	calcPagination: function(rowCount) {
		var pagination = [],
			currentPage = this.currentPage,
			totalPages = Math.floor(rowCount / this.pageSize + 1);
			(currentPage === 1) ? pagination.push({ text: '<', disabled: true }) : pagination.push({ text: '<', page: currentPage - 1 });
			_.each(_.range(currentPage - 4, currentPage + 5), function(i) {
				if (i < currentPage - 2 && totalPages - i <= 4 || i >= currentPage - 2 && i > 0 && pagination.length <= 5) {
					(i === currentPage) ? pagination.push({ text: i, page: i, active: true }) : pagination.push({ text: i, page: i });
				}
			});
			(currentPage === totalPages) ? pagination.push({ text: '>', disabled: true }) : pagination.push({ text: '>', page: currentPage + 1 });
		return pagination;
	}
});

var PostsView = Backbone.View.extend({
	el: '#main',
	render: function(options) {
		var that = this;
		var posts = new Posts();
		posts.currentPage = options.page;
		posts.offset = (posts.currentPage - 1) * posts.pageSize;
		posts.fetch({
			data: { pageSize: posts.pageSize, offset: posts.offset},
			success: function() {
				var template = _.template($('#posts-template').html(), {posts: posts.models, pagination: posts.pagination});
				that.$el.html(template);
			}
		});
	}
});

var EditPostView = Backbone.View.extend({
	el: '#main',
	render: function(options) {
		var that = this;
		if (options.id) {
			that.post = new Post({id: options.id});
			that.post.fetch({
				success: function(post) {
					var template = _.template($('#edit-post-template').html(), {post: post});
					that.$el.html(template);
				}
			});
		} else {
			var template = _.template($('#edit-post-template').html(), {post: null});
			this.$el.html(template);
		}
	},
	events: {
		'submit .edit-post-form': 'savePost',
		'click .delete': 'deletePost'
	},
	savePost: function(event) {
		var postDetails = $(event.currentTarget).serializeObject();
		var post = new Post();
		post.save(postDetails, {
			success: function(post) {
				router.navigate('', {trigger: true});
			}
		});
		return false;
	},
	deletePost: function(event) {
		this.post.destroy({
			success: function(post) {
				router.navigate('', {trigger: true});
			}
		});
		return false;
	}
});

var Router = Backbone.Router.extend({
	routes: {
		'': 'home',
		'addPost': 'editPost',
		'editPost/:id': 'editPost',
		'page/:page': 'showPage'
	}
});

var postsView = new PostsView();
var editPostView = new EditPostView();

var router = new Router();
router.on('route:home', function() {
	postsView.render({page: 1});
});
router.on('route:editPost', function(id) {
	editPostView.render({id: id});
});
router.on('route:showPage', function(page) {
	postsView.render({page: parseInt(page, 10)});
});

Backbone.history.start();