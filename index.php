<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset='utf-8'>
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
		<link rel="stylesheet" href="lib/css/bootstrap.min.css">
		<link rel="stylesheet" href="lib/css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="lib/css/bootstrap-blog.css">
		<link rel="stylesheet" href="lib/css/font-awesome.min.css">
		<link rel="stylesheet" href="lib/css/highlight-theme-monokai_sublime.css">
		<link rel="stylesheet" href="resources/css/stylesheet.css">
		<title>f3</title>
	</head>
	<body>
		<div class="blog-masthead">
			<div class="container">
				<nav class="blog-nav">
					<a class="blog-nav-item active" href="#">Home</a>
					<a class="blog-nav-item" href="#">New features</a>
					<a class="blog-nav-item" href="#">Press</a>
					<a class="blog-nav-item" href="#">New hires</a>
					<a class="blog-nav-item" href="#">About</a>
				</nav>
			</div>
		</div>
		<div class="container">

			<div class="blog-header">
				<h1 class="blog-title">f3</h1>
				<p class="lead blog-description">the future sound of taipei version 3</p>
			</div>

			<div class="row">

				<div class="col-sm-8 blog-main">
					<div id="main"></div>
				</div>

				<div class="col-sm-3 col-sm-offset-1 blog-sidebar">
					<div class="sidebar-module sidebar-module-inset">
						<h4>About</h4>
						<p>Etiam porta <em>sem malesuada magna</em> mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.</p>
					</div>
					<div class="sidebar-module">
						<h4>Archives</h4>
						<ol class="list-unstyled">
							<li><a href="#">January 2014</a></li>
							<li><a href="#">December 2013</a></li>
							<li><a href="#">November 2013</a></li>
							<li><a href="#">October 2013</a></li>
							<li><a href="#">September 2013</a></li>
							<li><a href="#">August 2013</a></li>
							<li><a href="#">July 2013</a></li>
							<li><a href="#">June 2013</a></li>
							<li><a href="#">May 2013</a></li>
							<li><a href="#">April 2013</a></li>
							<li><a href="#">March 2013</a></li>
							<li><a href="#">February 2013</a></li>
						</ol>
					</div>
					<div class="sidebar-module">
						<h4>Elsewhere</h4>
						<ol class="list-unstyled">
							<li><a href="#">GitHub</a></li>
							<li><a href="#">Twitter</a></li>
							<li><a href="#">Facebook</a></li>
						</ol>
					</div>
				</div>

			</div>
		</div>
		<div class="blog-footer">
			<p>
				<a href="#">Back to top</a>
			</p>
		</div>
		<?php
			include ("resources/templates/controls.template");
			include ("resources/templates/pagination.template");
			include ("resources/templates/posts.template");
			include ("resources/templates/editPost.template");
		?>
		<script src="lib/js/jquery.min.js"></script>
		<script src="lib/js/underscore-min.js"></script>
		<script src="lib/js/backbone-min.js"></script>
		<script src="lib/js/highlight-min.js"></script>
		<script src="resources/js/app.js"></script>
	</body>
</html>
