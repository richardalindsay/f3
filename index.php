<!DOCTYPE html>
<html>
	<head>
		<meta charset='utf-8'>
		<link rel="stylesheet" href="lib/css/bootstrap.min.css">
		<link rel="stylesheet" href="lib/css/bootstrap-theme.min.css">
		<link rel="stylesheet" href="lib/css/font-awesome.min.css">
		<link rel="stylesheet" href="lib/css/highlight-theme-monokai_sublime.css">
		<link rel="stylesheet" href="resources/css/stylesheet.css">
		<title>f3</title>
	</head>
	<body>
		<div class="container">
			<header>
				<h1>f3</h1>
			</header>
			<div id="main"></div>
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