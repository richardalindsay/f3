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
			],
			posts: {}
		},

		tools = {
			init: function() {
				$(window).on('hashchange', events.router);
				$('body').on('click', '[data-event]', events.handler);
				events.router();
			},

			popTmpl: function(data, tmpl) {
				var tmpl = $(tmpl).get(0).innerHTML,
					$fragment = $('<div/>'),
					tmplTmp,
					row;
				$.each(data, function(index, val) {
					tmplTmp = tmpl;
					row = $(tools.popTmplRow(tmplTmp, val));
					$fragment.append(row);
				});
				return $fragment.children();
			},

			popTmplRow: function(tmplRow, data) {
				$.each(data, function(index, val) {
					if (tmplRow.match(new RegExp('<textarea.*>.*{' + index + '}.*<\/textarea>', 'g'))) {
						val = val.replace(/<br>/g, '\n');
					}
					tmplRow = tmplRow.replace(new RegExp('{' + index + '}', 'g'), val);
				});
				return tmplRow;
			}

		},

		events = {
			handler: function(event) {
				var dataEvent = $(event.target).data('event'),
					needEvent = $.inArray(dataEvent, settings.needEvent) > -1;
				event.preventDefault();
				(needEvent) ? events[dataEvent](event) : events[dataEvent]();
			},

			router: function() {
				var hashLink = location.hash.slice(1) || '/';
				if (hashLink === '/') {
					blog.getBlog();
				} else if (hashLink === '/add') {
					events.renderAddPostPage();
				} else if (hashLink.match(/^\/page\/\d*/)) {
					var page = hashLink.match(/^\/page\/(\d+)/)[1];
					events.gotoPage(page);
				} else {
					location.hash = '/';
				}
			},

			gotoPage: function(page) {
				var pageSize = settings.pageSize,
					offset = (page - 1) * pageSize;
				blog.getBlog(offset);
			},

			clickPagination: function(event) {
				var	page = $(event.target).closest('[data-id]').data('id'),
					pageSize = settings.pageSize,
					offset = (page - 1) * pageSize;
				blog.getBlog(offset);
			},

			renderAddPostPage: function(post) {
				var type = (post) ? 'edit' : 'add',
					post = post || [{ id : '', title: '', content: ''}];
				$('body').append(tools.popTmpl(post, '#addPostTemplate'));
				$('#addPost input[type=submit]').val(type);
				$('#addPost input[type=submit]').attr('data-event', type + 'Post');
				document.title = 'f3 - ' + type.charAt(0).toUpperCase() + type.slice(1) + ' Post';
				$('#blog').hide();
			},

			renderEditPostPage: function(event) {
				var id = $(event.target).closest('[data-id]').data('id'),
					posts = settings.posts,
					post = [];
				for (var i = 0, l = posts.length; i < l; i++) {
					var tmpPostObj = posts[i],
						postObj;
					if (parseInt(tmpPostObj.id, 10) === id) {
						postObj = posts[i];
					}
				}
				post.push(postObj);
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
					data: $('#addPost form').serialize().replace(/%0(D%0A|A|D)/g, '<br>')
				}).done(function() {
					location.hash = '/';
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
				$.ajax(url).done(function(postsXML) {
					$.ajax('resources/xsl/posts.xsl').done(function(postsXSL) {
						blog.render(postsXML, postsXSL);
					});
				});
			},

			render: function(xml, xsl) {
				var rowCount = $(xml).find('rowCount').text();
				this.renderPagination(rowCount);
				this.renderPosts(xml, xsl);
			},

			renderPagination: function(rowCount) {
				var pagination = [],
					pageSize = settings.pageSize,
					pagesCount = Math.floor((rowCount - 1) / pageSize) + 1,
					paginationItem;
				for (var i = 1; i <= pagesCount; i++) {
					paginationItem = { id: i, pagination: i };
					pagination.push(paginationItem);
				}	
				$('#pagination').append(tools.popTmpl(pagination, '#paginationTemplate'));
			},

			renderPosts: function(xml, xsl) {
				var xsltProcessor = new XSLTProcessor(),
					resultDocument;
  				xsltProcessor.importStylesheet(xsl);
  				resultDocument = xsltProcessor.transformToFragment(xml, document);
  				$("#posts").append(resultDocument);
			}
		};
 
}());