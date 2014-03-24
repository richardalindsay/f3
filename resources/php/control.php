<?php
	$action = $_GET["action"];
	$postId = $_GET["postId"];
	$title = $_POST["title"];
	$content = $_POST["content"];
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	if ($action == "addPost") {
		mysqli_query($con, "INSERT INTO posts (title, content) VALUES ('$title', '$content')");
		header("Location: ../../");
	}
	elseif ($action == "editPost") {
		mysqli_query($con, "UPDATE posts SET title = '$title', content = '$content' WHERE id = $postId");
		header("Location: ../../");
	}
	elseif ($action == "deletePost") {
		mysqli_query($con, "DELETE FROM posts WHERE id = $postId");
		header("Location: ../../");
	}
?>