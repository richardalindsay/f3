<?php
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	if (isset($_GET["action"])) $action = $_GET["action"];
	if (isset($_GET["page"])) $page = $_GET["page"];
	if (isset($_GET["offset"])) $offset = $_GET["offset"];
	if (isset($_GET["pageSize"])) $pageSize = $_GET["pageSize"];
	if (isset($_GET["postId"])) $postId = $_GET["postId"];
	if (isset($_POST["title"])) $title = mysqli_real_escape_string($con, $_POST["title"]);
	if (isset($_POST["content"])) $content = mysqli_real_escape_string($con, $_POST["content"]);
	if (isset($action)) $action();
	mysqli_close($con);

	function getPosts() {
		global $pageSize, $offset, $con;
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT ".$pageSize." OFFSET ".$offset;
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$info = mysqli_fetch_assoc($rowCountResult);
		$postsResult = mysqli_query($con, $postsQuery);
		foreach ($postsResult as $postsRow) {
			$posts[] = $postsRow;
		}
		$data = array('info' => $info, 'posts' => $posts);
		header('Content-type: application/json');
		echo json_encode($data);		
	}

	function addPost() {
		global $con, $title, $content;
		$addPostQuery = "INSERT INTO posts (title, content) VALUES ('$title', '$content')";
		mysqli_query($con, $addPostQuery);
		header('Content-type: application/json');
		echo json_encode("addPost complete");
	}

	function editPost() {
		global $con, $postId, $title, $content;
		$editPostQuery = "UPDATE posts SET title = '$title', content = '$content' WHERE id = $postId";
		mysqli_query($con, $editPostQuery);
		header('Content-type: application/json');
		echo json_encode("editPost complete");
	}

	function deletePost() {
		global $con, $postId;
		$deletePostQuery= "DELETE FROM posts WHERE id = $postId";
		mysqli_query($con, $deletePostQuery);
		header('Content-type: application/json');
		echo json_encode("deletePost complete");	
	}
?>