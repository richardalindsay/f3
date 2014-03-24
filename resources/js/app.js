(function() {

	var ready = $(function() { tools.init(); }),

		settings = {
			pageSize: 10,
			url: {
				getBlog: 'resources/php/control.php?action=getPosts&offset=',
				addPost: 'resources/php/control.php?action=addPost',
				editPost: 'resources/php/control.php?action=editPost&postId=',
				deletePost: 'resources/php/control.php?action=deletePost&postId='
			},
			needEvent: [
				'clickPagination',
				'renderEditPostPage',
				'deletePost'
			]
		},

		tools = {
			init: function() {
				$('body').on('click', '[data-event]', events.handler);
				blog.getBlog();
			},

			populateTemplate: function(args) {
				var data = args.data,
					el = args.el,
					template = args.template,
					$template =	$($(template)[0].innerHTML),
					fragment = $('<div/>'),
					$templateTmp,
					$dataTemplateEl,
					val;
				if (data) {
					$.each(data, function(i, row) {
						$templateTmp = $template.clone();
						$templateTmp.attr('data-id', row.id);
						$templateTmp.find('[data-template]').each(function() {
							$dataTemplateEl = $(this);
							val = $dataTemplateEl.data('template');
							if ($dataTemplateEl.is('input[type=text]')) {
								$dataTemplateEl.val(row[val]);
							} else if ($dataTemplateEl.is('textarea')) {
								$dataTemplateEl.val(row[val].replace(/<br>/g, '\n'));
							}
							else {
								$dataTemplateEl.html(row[val]);
							}
						});
						fragment.append($templateTmp);
					});
				} else {
					fragment.append($template);
				}
				$(el).append(fragment.children());
			}
		},

		events = {
			handler: function(event) {
				var dataEvent = $(event.target).data('event'),
					needEvent = $.inArray(dataEvent, settings.needEvent) > -1;
				event.preventDefault();
				(needEvent) ? events[dataEvent](event) : events[dataEvent]();
			},

			clickPagination: function(event) {
				var	page = $(event.target).closest('[data-id]').data('id'),
					pageSize = settings.pageSize,
					offset = (page - 1) * pageSize;
				blog.getBlog(offset);
			},

			renderAddPostPage: function(post) {
				var type = (post) ? 'edit' : 'add' ;
				tools.populateTemplate({
					data : post,
					el : 'body',
					template : '#addPostTemplate'
				});
				$('#addPost input[type=submit]').val(type);
				$('#addPost input[type=submit]').attr('data-event', type + 'Post');
				document.title = 'f3 - ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Post';
				$('#blog').hide();
				$('#addPost').show();
			},

			renderEditPostPage: function(event) {
				var $post = $(event.target).closest('[data-id]'),
					$dataTemplate = $post.find('[data-template]'),
					id = $post.attr('data-id'),
					tmpPost = { id: id },
					post = [],
					dataTemplateEl,
					prop,
					value;
				$dataTemplate.each(function() {
					$dataTemplateEl = $(this);
					prop = $dataTemplateEl.data('template');
					value = $dataTemplateEl.html();
					tmpPost[prop] = value;
				});
				post.push(tmpPost);
				this.renderAddPostPage(post);
			},

			deletePost: function(event) {
				var id = $(event.target).closest('[data-id]').data('id');
				if (confirm('Are you sure?')) {
					$.ajax({
						url: settings.url.deletePost + id
					}).done(function() {
						blog.getBlog();
					});
				}
			},

			addPost: function(id) {
				var addPostUrl = (id) ? settings.url.editPost + id : settings.url.addPost;
				$.ajax({
					type: 'post', 
					url: addPostUrl,
					data: ($('#addPost form').serialize().replace(/%0(D%0A|A|D)/g, '<br>').replace(/<pre>(.*?)<\/pre>/g, function(x) { return x.replace(/</g, '&lt;') }))
				}).done(function() {
					blog.getBlog();
				});
			},

			editPost: function() {
				this.addPost($('#addPost').data('id'));
			}	
		},

		blog = {
			getBlog: function(offset) {
				var offset = offset || 0,
					pageSize = settings.pageSize,
					url = settings.url.getBlog + offset + '&pageSize=' + pageSize;
				document.title = 'f3';
				$('#pagination').empty();
				$('#posts').empty();
				$('#addPost').remove();
				$('#blog').show();			
				$.ajax(url).done(function(response) {
					blog.render(response);
				});
			},

			render: function(data) {
				var rowCount = data.info.rowCount,
					posts = data.posts;
				this.renderPagination(rowCount);
				this.renderPosts(posts);
			},

			renderPagination: function(rowCount) {
				var pagination = [],
					pageSize = settings.pageSize,
					pagesCount = Math.floor((rowCount - 1) / pageSize) + 1,
					paginationItem;
				for (var i = 1; i <= pagesCount; i++) {
					paginationItem = { 
						id: i,
						pagination: i 
					}
					pagination.push(paginationItem);
				}	
				tools.populateTemplate({
					data: pagination, 
					el: '#pagination', 
					template: '#paginationTemplate'
				});
			},

			renderPosts: function(posts) {
				tools.populateTemplate({
					data: posts, 
					el: '#posts', 
					template: '#postsTemplate'
				});
			}
		};
 
}());