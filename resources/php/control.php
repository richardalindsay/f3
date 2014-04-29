<?php
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	$method = $_SERVER['REQUEST_METHOD'];
	$request = explode('/', $_SERVER['PATH_INFO']);
	$action = $request[1];
	if (isset($request[2])) $id = $request[2];
	if ($method == "GET" && $action == "blog") {
		$pageSize = $_GET['pageSize'];
		$offset = $_GET['offset'];
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT $pageSize OFFSET $offset";
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$pagination = mysqli_fetch_assoc($rowCountResult);
		$postsResult = mysqli_query($con, $postsQuery);
		foreach ($postsResult as $postsRow) {
			$posts[] = $postsRow;
		}
		$data = array('pagination' => $pagination, 'posts' => $posts);
		header('Content-type: application/json');
		echo json_encode($data);
	} else if ($method == "GET" && $action == "post" && isset($id)) {
		$addPostQuery = "SELECT * FROM posts WHERE id = $id";
		$postsResult = mysqli_query($con, $addPostQuery);
		$data = mysqli_fetch_assoc($postsResult);
		header('Content-type: application/json');
		echo json_encode($data);
	} else if ($method == "POST" && $action == "post") {
		$post = json_decode(file_get_contents('php://input'), true);
		$title = mysqli_real_escape_string($con, $post['title']);
		$content = mysqli_real_escape_string($con, $post['content']);
		$addPostQuery = "INSERT INTO posts (title, content) VALUES ('$title', '$content')";
		mysqli_query($con, $addPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => mysqli_insert_id($con), 'title' => $title, 'content' => $content));
	} else if ($method == "PUT" && $action == "post" && isset($id)) {
		$put = json_decode(file_get_contents('php://input'), true);
		$title = mysqli_real_escape_string($con, $put['title']);
		$content = mysqli_real_escape_string($con, $put['content']);
		$editPostQuery = "UPDATE posts SET title = '$title', content = '$content' WHERE id = $id";
		mysqli_query($con, $editPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => $id, 'title' => $title, 'content' => $content));
	} else if ($method == "DELETE" && $action == "post" && isset($id)) {
		$deletePostQuery = "DELETE FROM posts WHERE id = $id";
		mysqli_query($con, $deletePostQuery);
		header('Content-type: application/json');
		echo json_encode("delete post successful");
	}
?>