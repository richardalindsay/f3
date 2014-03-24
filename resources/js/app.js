(function() {

	var ready = (!window.addEventListener) ? document.attachEvent('onreadystatechange', function() { tools.init(); }) : window.addEventListener('DOMContentLoaded', function() { tools.init(); }),

		settings = {
			pageSize: 10,
			url: {
				getBlog: 'resources/php/control.php?action=getPosts&offset=',
				addPost: 'resources/php/control.php?action=addPost',
				editPost: 'resources/php/control.php?action=editPost&postId=',
				deletePost: 'resources/php/control.php?action=deletePost&postId='
			}
		},

		$ = function(selector) {
			var first = selector.charAt(0),
				type,
				value,
				ret;
			if (first === '#') {
				type = 'id';
			} else if (first === '.') {
				type = 'class';
			} else if (first === '[') {
				type = 'attr';
			} else {
				type = 'tag';
			}
			if (type === 'id') {
				value = selector.slice(1);
				ret = document.getElementById(value);
			} else if (type === 'class') {
				value = selector.slice(1);
				ret = document.getElementsByClassName(value);
			}
			return ret;
		},

		tools = {
			init: function() {
				var docBody = document.body;
				(!docBody.addEventListener) ? docBody.attachEvent('onclick', events.handler) : docBody.addEventListener('click', events.handler, false);
				blog.getBlog();
			},

			doAjax: function(args) {
				var done = args.done,
					url = args.url,
					type = args.type || 'get',
					data = args.data,
					callback = args.callback,
					ajax = new XMLHttpRequest(),
					response;
				ajax.onreadystatechange = function() {
					if (ajax.readyState === 4 && ajax.status === 200) {
						response = JSON.parse(ajax.responseText);
						callback(response);
					}
				};
				ajax.open(type, url, true);
				if (type === 'post') ajax.setRequestHeader('Content-type','application/x-www-form-urlencoded');
				ajax.send(data);
			},

			serialize: function(element) {
				var	$elements = element.querySelectorAll('[name]'),
					$element,
					data = [],
					encodedString;
				for (var i = 0, l = $elements.length; i < l; i++) {
					$element = $elements[i];
					data.push($element.getAttribute('name') + '=' + encodeURIComponent($element.value));
					if (i < l - 1) {
						data.push('&');
					}
				}
				encodedString = data.join('');
				return encodedString;
			},

			parseHTML: function(htmlString) {
				var trimmedHtmlString = htmlString.replace(/^\s+|\s+$/g, ''),
					tmp = document.createElement('div'),
					firstChild;
			    tmp.innerHTML = trimmedHtmlString;
			    firstChild = tmp.firstChild;
			    return firstChild;
			},

			escapeHtml: function(str) {
			    var div = document.createElement('div');
			    div.appendChild(document.createTextNode(str));
			    return div.innerHTML;
			},
			
			populateTemplate: function(args) {
				var	data = args.data,
					el = args.el,
					template = args.template,
					$el = $(el),
					$fragment,
					$template,
					$templateFragment,
					$templateFragmentTmp,
					$dataTemplate,
					$dataId,
					$dataTemplateTmp,
					tag,
					prop,
					dataTmp;
				if (template) {
					$fragment = document.createDocumentFragment();
					$template = $(template).innerHTML;
					$templateFragment = document.createDocumentFragment();
					$templateFragment.appendChild(tools.parseHTML($template));
				} else {
					$templateFragmentTmp = $el;
				}
				for (var i = 0, l = data.length; i < l; i++) {
					if (template) $templateFragmentTmp = $templateFragment.cloneNode(true);
					$dataId = $templateFragmentTmp.querySelector('[data-id]');
					if ($dataId === null && $templateFragmentTmp.dataset.id !== null) {
						$dataId = $templateFragmentTmp;
					}
					$dataId.dataset.id = data[i].id;
					$dataTemplate = $templateFragmentTmp.querySelectorAll('[data-template]');
					for (var j = 0, m = $dataTemplate.length; j < m; j++) {
						$dataTemplateTmp = $dataTemplate[j];
						tag = $dataTemplateTmp.tagName;
						prop = $dataTemplateTmp.dataset.template;
						dataTmp = data[i][prop];
						if (tag === 'INPUT' || tag === 'TEXTAREA') {
							$dataTemplateTmp.value = dataTmp;
						} else {
							$dataTemplateTmp.innerHTML = dataTmp;
						}
					}
					if (template) $fragment.appendChild($templateFragmentTmp);
				}
				if (template) $el.appendChild($fragment);
			},

			closest: function(tar, $cur, type) {
				var first = tar.charAt(0),
					type,
					value,
					regEx,
					success,
					ret;
				if (!type) {
					if (first === '[') {
						type = 'attr';
					} else if (first === '.') {
						type = 'class';
					} else {
						type = 'tag';
					}
				}
				if (type === 'attr') {
					value = tar.slice(1, tar.length - 1);
					if ($cur.getAttribute(value) !== null) success = true;
				} else if (type === 'class') {
					value = tar.slice(1);
					regEx = new RegExp('\\b' + value + '\\b');
					if ($cur.className.match(regEx)) success = true;
				} else if (type === 'tag') {
					value = tar.toUpperCase();
					if ($cur.tagName === value) success = true;
				}
				if (success) {
					return $cur;
				} else {
					return tools.closest(tar, $cur.parentNode, type);
				}
			}
		},

		events = {
			handler: function(event) {
				var $el = (event.target) ? event.target : window.event.srcElement,
					dataEvent = $el.dataset.event;
				if (dataEvent) {
					(event.preventDefault) ? event.preventDefault() : event.returnValue = false;
					events[dataEvent](event);
				}
			},

			clickPagination: function(event) {
				var $el = (event.target) ? event.target : window.event.srcElement,
					page = tools.closest('[data-id]', $el).dataset.id;
					pageSize = settings.pageSize,
					offset = (page - 1) * pageSize;
				blog.getBlog(offset);
			},

			renderAddPostPage: function(event, args) {
				var $addPost = $('#addPost'),
					$post = (args) ? args.$post : $addPost,				
					$blog = $('#blog'),			
					$dataTemplate = $post.querySelectorAll('[data-template]'),
					$submit = $('#addPost').querySelector('input[type=submit]'),
					tmpData = (args) ? { id : args.id } : { id : '' },
					data = [],
					$dataTemplateTmp,
					prop,
					key;
				for (i = 0, l = $dataTemplate.length; i < l; i++) {
					$dataTemplateTmp = $dataTemplate[i];
					prop = $dataTemplateTmp.dataset.template;
					key = (args) ? $dataTemplateTmp.innerHTML : '';
					tmpData[prop] = key;
				}
				data.push(tmpData);
				tools.populateTemplate({
					data : data,
					el : '#addPost'
				});
				if (args) {
					$submit.value = 'edit';
					$submit.dataset.event = 'editPost';
					document.title = 'f3 - Edit Post';
				} else {
					$submit.value = 'add';
					$submit.dataset.event = 'addPost';
					document.title = 'f3 - Add Post';
				}		
				$blog.style.display = 'none';
				$addPost.style.display = 'block';
			},

			renderEditPostPage: function(event) {
				var $el = (event.target) ? event.target : window.event.srcElement,
					$post = tools.closest('[data-id]', $el),
					id = $post.dataset.id;
				events.renderAddPostPage('', {
					$post : $post, 
					id : id
				});
			},

			deletePost: function(event) {
				var $el = (event.target) ? event.target : window.event.srcElement,
					id = tools.closest('[data-id]', $el).dataset.id;
				tools.doAjax({
					url : settings.url.deletePost + id,
					callback : function() {
						blog.getBlog();
					}
				});
			},

			addPost: function() {
				var $addPost = $('#addPost');
				tools.doAjax({
					url : settings.url.addPost,
					type : 'post',
					data : tools.serialize($addPost),
					callback : function() {
						blog.getBlog();
					}
				});
			},

			editPost: function() {
				var $addPost = $('#addPost'),
					id = $addPost.dataset.id;
				tools.doAjax({
					url : settings.url.editPost + id,
					type : 'post',
					data : tools.serialize($addPost),
					callback : function() {
						blog.getBlog();
					}
				});
			}
		},

		blog = {
			getBlog: function(value) {
				var $pagination = $('#pagination'),
					$posts = $('#posts'),
					offset = value || 0,
					pageSize = settings.pageSize,
					url = settings.url.getBlog + offset + '&pageSize=' + pageSize;
				document.title = 'f3';			
				while ($pagination.firstChild) $pagination.removeChild($pagination.firstChild);
				while ($posts.firstChild) $posts.removeChild($posts.firstChild);
				$('#addPost').style.display = 'none';
				$('#blog').style.display = 'block';
				tools.doAjax({
					url : url,
					callback : function(response) { 
						blog.render(response);
					} 
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
					pagesCount = Math.floor((rowCount - 1) / pageSize) + 1,
					paginationItem;
				for (var i = 1; i <= pagesCount; i++) {
					paginationItem = { 
						id : i,
						pagination : i 
					}
					pagination.push(paginationItem);
				}
				tools.populateTemplate({
					data : pagination,
					el : '#pagination', 
					template : '#paginationTemplate'
				});
			},

			renderPosts: function(posts) {
				tools.populateTemplate({
					data : posts,
					el : '#posts', 
					template : '#postsTemplate'
				});
			}
		};

}());