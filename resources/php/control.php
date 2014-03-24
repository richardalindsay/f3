<?php

	$action = $_GET["action"];
	if (isset($_GET["page"])) $page = $_GET["page"];
	if (isset($_GET["offset"])) $offset = $_GET["offset"];
	if (isset($_GET["pageSize"])) $pageSize = $_GET["pageSize"];
	if (isset($_GET["postId"])) $postId = $_GET["postId"];
	if (isset($_POST["title"])) $title = $_POST["title"];
	if (isset($_POST["content"])) $content = $_POST["content"];
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");

	if ($action == "getPosts") {
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT ".$pageSize." OFFSET ".$offset;
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$info = mysqli_fetch_assoc($rowCountResult);
		$postsResult = mysqli_query($con, $postsQuery);
		foreach ($postsResult as $row) {
			$posts[] = $row;
		}
		$data = array('info' => $info, 'posts' => $posts);
		header('Content-type: application/json');
		echo json_encode($data);
	}
	elseif ($action == "addPost") {
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

	mysqli_close($con);
?>