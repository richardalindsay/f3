<?php
	$page = isset($_GET["page"]) ? $_GET["page"] : 1;
	$pageSize = 10;
	$offset = ($page - 1) * $pageSize;
?>
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html>
	<head>
		<link rel="stylesheet" type="text/css" href="resources/css/stylesheet.css">
		<title>f3</title>
	</head>
	<body>
		<div id="header">
			<h1>f3</h1>
			<p>Apache, HTML, CSS, MySQL, PHP</p>
		</div>
		<div id="control">
			<a href="resources/html/addPost.html">add</a>
		</div>
		<ul id="pagination">
			<?php
				$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
				$paginationResult = mysqli_query($con, "SELECT * FROM posts");
				$numRows = mysqli_num_rows($paginationResult);
				$numPages = ceil($numRows/$pageSize);
				for ($i = 1; $i <= $numPages; $i++) {
					echo "<li>";
					echo "	<a href='index.php?page=$i'>$i</a>";
					echo "</li>";
				}	
			?>
		</ul>
		<ul id="posts">
			<?php
				$postsResult = mysqli_query($con, "SELECT * FROM posts ORDER BY id DESC LIMIT $pageSize OFFSET $offset");
				while($row = mysqli_fetch_array($postsResult)) {
					$title = $row["title"];
					$date = $row["date"];
					$content = $row["content"];
					$id = $row["id"];
					echo "<li>";
					echo "	<h2>$title</h2>";
	    			echo "	<span>by fsot on$date</span><br>";
	    			echo "	<br>";
	    			echo "	$content<br>";
	    			echo "	<br>";
	    			echo "	<a href='resources/php/editPost.php?postId=$id'>edit</a>";
					echo "	<a href='resources/php/control.php?action=deletePost&postId=$id'>delete</a>";
					echo "</li>";
				}
			?>
		</ul>
	</body>
</html>