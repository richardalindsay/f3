(function(){

	var settings = {
		pageSize: 10
	}

	function ajax (complete, url) {
		var element;
		var getElement = new XMLHttpRequest();
		getElement.onreadystatechange = function() {
			if (getElement.readyState == 4 && getElement.status == 200) {
		    	element = JSON.parse(getElement.responseText);
		    	complete(element);
		   	}
		}
		getElement.open("GET", url, true);
		getElement.send();	
	}

	function initialize () {
	    getData();
	}

	function getData (offset) {
		var offset = offset || 0;
		var url = "resources/php/control.php?action=getPosts&offset=" + offset + "&pageSize=" + settings.pageSize;
		ajax(render, url);
	}

	function render (data) {
		var rowCount = data.info.rowCount,
			posts = data.posts;
		renderPagination(rowCount);
		renderPosts(posts);
	}

	function renderPagination(rowCount) {
		var pagesCount = Math.floor((rowCount - 1) / settings.pageSize) + 1,
			pC = document.getElementById("pagination");
		while (pC.firstChild) pC.removeChild(pC.firstChild);
		for (var i = 1; i <= pagesCount; i++) {
			var listItem = document.createElement("li");
			var link = document.createElement("a");
			var spacer = document.createTextNode(" ");
			link.id = "page_" + i;
			link.href = "";
			link.innerHTML = i;
			listItem.appendChild(link);
			pC.appendChild(listItem);
			pC.appendChild(spacer);
		}
	}

	function renderPosts(posts) {
		var id,
			date,
			title,
			content,
			pC = document.getElementById("posts");
		while (pC.firstChild) pC.removeChild(pC.firstChild);
		for (i in posts) {
			id = posts[i].id;
			date = posts[i].date;
			title = posts[i].title;
			content = posts[i].content;
			var listItem = document.createElement("li");
			var header = document.createElement("h2");
			var dateSpan = document.createElement("span");
			var mainContent = document.createElement("p");
			var editLink = document.createElement("a");
			var spacer = document.createTextNode(" ");
			var deleteLink = document.createElement("a");
			header.innerHTML = title;
			dateSpan.innerHTML = "by fsot on " + date;
			mainContent.innerHTML = content;
			editLink.innerHTML = "edit";
			deleteLink.innerHTML = "delete";
			editLink.href = "resources/php/editPost.php?postId=" + id;
			deleteLink.href = "resources/php/control.php?action=deletePost&postId=" + id;
			listItem.appendChild(header);
			listItem.appendChild(dateSpan);
			listItem.appendChild(mainContent);
			listItem.appendChild(editLink);
			listItem.appendChild(spacer);
			listItem.appendChild(deleteLink);
			pC.appendChild(listItem);
		}
	}

	document.getElementById("pagination").addEventListener("click", function(event) {
		var id = event.target.id;
		if (id.match(/^page/)) {
			event.preventDefault();
			var page = id.match(/\d+$/);
			var offset = (page - 1) * settings.pageSize;
			getData(offset);
		}
	});

	window.addEventListener("DOMContentLoaded", function() {
		initialize();
	});

}());