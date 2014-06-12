<?php
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	$method = $_SERVER['REQUEST_METHOD'];
	$request = explode('/', $_SERVER['PATH_INFO']);
	$action = $request[1];
	if (isset($request[2])) $id = $request[2];

	if ($action == "blog") {
		if (isset($id)) {
		} else {
			if ($method == "GET") blog_get();
		}
	} else if ($action == "post") {
		if (isset($id)) {
			if ($method == "GET") post_id_get();
			else if ($method == "PUT") post_id_put();
			else if ($method == "DELETE") post_id_delete();
		} else {
			if ($method == "POST") post_post();
		}
	}

	function blog_get() {
		global $con;
		$pageSize = $_GET['pageSize'];
		$offset = $_GET['offset'];
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT $pageSize OFFSET $offset";
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$pagination = mysqli_fetch_assoc($rowCountResult);
		$postsResult = mysqli_query($con, $postsQuery);
		foreach ($postsResult as $postsRow) $posts[] = $postsRow;
		$data = array('pagination' => $pagination, 'posts' => $posts);
		header('Content-type: application/json');
		echo json_encode($data);	
	}

	function post_id_get() {
		global $con, $id;
		$addPostQuery = "SELECT * FROM posts WHERE id = $id";
		$postsResult = mysqli_query($con, $addPostQuery);
		$data = mysqli_fetch_assoc($postsResult);
		header('Content-type: application/json');
		echo json_encode($data);
	}

	function post_id_put() {
		global $con, $id;
		$put = json_decode(file_get_contents('php://input'), true);
		$title = mysqli_real_escape_string($con, $put['title']);
		$content = mysqli_real_escape_string($con, $put['content']);
		$editPostQuery = "UPDATE posts SET title = '$title', content = '$content' WHERE id = $id";
		mysqli_query($con, $editPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => $id, 'title' => $title, 'content' => $content));	
	}

	function post_id_delete() {
		global $con, $id;
		$deletePostQuery = "DELETE FROM posts WHERE id = $id";
		mysqli_query($con, $deletePostQuery);
		header('Content-type: application/json');
		echo json_encode("delete post successful");		
	}

	function post_post() {
		global $con;
		$post = json_decode(file_get_contents('php://input'), true);
		$title = mysqli_real_escape_string($con, $post['title']);
		$content = mysqli_real_escape_string($con, $post['content']);
		$addPostQuery = "INSERT INTO posts (title, content) VALUES ('$title', '$content')";
		mysqli_query($con, $addPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => mysqli_insert_id($con), 'title' => $title, 'content' => $content));
	}
?>