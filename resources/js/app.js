(function() {

	var ready = $(function() { tools.init(); }),

		settings = {
			pageSize: 10,
			url: {
				addPost: 'resources/php/control.php?action=addPost',
				getBlog: 'resources/php/control.php?action=getPosts&offset=',
				showEditPost: 'resources/php/control.php?action=showEditPost&postId=',
				deletePost: 'resources/php/control.php?action=deletePost&postId=',
				editPost: 'resources/php/control.php?action=editPost&postId='
			}
		},

		tools = {
			init: function() {
				var $body = $("body");
				$body.on('click', '[data-event]', events.handler);
				blog.getBlog();
			},

			populateTemplate: function(exists, isForm, data, template, element) {
				var el,
					value,
					$template;			
				if(exists) {
					var $template = template;
				} else {
					var html = '',
						template = template[0].innerHTML,
						$element = element;
				}
				$.each(data, function(i, row) {
					if(!exists) $template = $(template);
					if (row.id) {
						$template.attr('data-id', row.id);
					}
					$template.find('[data-template]').each(function() {
						el = $(this);
						value = el.attr('data-template');
						if (isForm) {
							el.val(row[value]);
						} else {
							el.text(row[value]);
						}
					});
					if(!exists) html += $template[0].outerHTML;
				});
				if(!exists) $element.append(html);
			}
		},

		events = {
			handler: function(event) {
				event.preventDefault();
				var el = $(event.target);
				var dataEvent = el.attr('data-event');
				events[dataEvent](event);
			},

			clickPagination: function(event) {
				var	pageSize = settings.pageSize,
					page = $(event.target).text(),
					offset = (page - 1) * pageSize;
				blog.getBlog(offset);
			},

			renderAddPostPage: function(event) {
				var text = $(event.target).text(),
					id = $(event.target).closest('[data-id]').attr('data-id'),
					type		;
				if(text === "add") {
					type = "Add";
				} else if(text === "edit") {
					type = "Edit";
				}
				$('#blog').hide();
				$('#addPost input[type=text], #addPost textarea').val('');
				$('#addPost').show();
				document.title = 'f3 - ' + type + ' Post';
				$('#addPost form').attr('id', type.toLowerCase() + 'PostForm');
				if(id) {
					$('#addPost form').attr('data-id', id);
				} else {
					$('#addPost form').attr('data-id', '');
				}
				$('#addPost input[type=submit]').val(type.toLowerCase());
				$('#addPost input[type=submit]').attr('data-event', 'send' + type + 'Post');
				if (type === "Edit") {
					var ajax = $.ajax(settings.url.showEditPost + id).done(function(data) {
						tools.populateTemplate(true, true, data, $('#editPostForm'), true);
					});
				}
			},

			renderAddPostPage2: function(event) {
				$('#blog').hide();
				$('#addPost form').attr('id', 'addPostForm');
				$('#addPost form').attr('data-id', '');
				$('#addPost input[type=text], #addPost textarea').val('');
				$('#addPost input[type=submit]').val('add');
				$('#addPost input[type=submit]').attr('data-event', 'sendAddPost');
				document.title = 'f3 - Add Post';
				$('#addPost').show();
			},

			deletePost: function(event) {
				var id = $(event.target).closest('[data-id]').attr('data-id'),
					ajax = $.ajax({
						url: settings.url.deletePost + id
					}).done(function() {
						blog.getBlog();
					});
			},

			sendAddPost: function(event) {
				var ajax = $.ajax({
					type: "POST", 
					url: settings.url.addPost,
					data: $('#addPostForm').serialize()
				}).done(function() {
					$('#addPost').hide();
					blog.getBlog();
				});
			},

			sendEditPost: function(event) {
				var id = $(event.target).closest('[data-id]').attr('data-id'),
					ajax = $.ajax({
						type: "POST", 
						url: settings.url.editPost + id,
						data: $('#editPostForm').serialize()
					}).done(function() {
						$('#addPost').hide();
						blog.getBlog();
					});
			}	
		},

		blog = {
			getBlog: function(value) {
				document.title = 'f3';
				$('#pagination').empty();
				$('#posts').empty();
				$('#addPost').hide();
				$('#blog').show();
				var pageSize = settings.pageSize,
					offset = value || 0,
					url = settings.url.getBlog + offset + '&pageSize=' + pageSize;
					ajax = $.ajax(url).done(function(data) {
						blog.render(data);
					});
			},

			render: function(data) {
				var rowCount = data.info.rowCount,
					posts = data.posts;
				blog.renderPagination(rowCount);
				blog.renderPosts(posts);
			},

			renderPagination: function(rowCount) {
				var pagination = [],
					pageSize = settings.pageSize,
					pagesCount = Math.floor((rowCount - 1) / pageSize) + 1;
				for (var i = 1; i <= pagesCount; i++) {
					var paginationItem = { pagination: i }
					pagination.push(paginationItem);
				}	
				tools.populateTemplate(false, false, pagination, $('#paginationTemplate'), $('#pagination'));
			},

			renderPosts: function(posts) {
				tools.populateTemplate(false, false, posts, $('#postsTemplate'), $('#posts'));
			}
		};
 
}());