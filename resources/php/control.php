<?php
	$con = mysqli_connect("localhost", "root", "p3rfecto", "f3");
	require '../../lib/php/Slim/Slim.php';
	\Slim\Slim::registerAutoloader();
	$app = new \Slim\Slim();
	$app->get('/blog/', function() use($app, $con){
		$pageSize = $app->request()->get('pageSize');
		$offset = $app->request()->get('offset');
		$rowCountQuery = "SELECT COUNT(*) AS rowCount FROM posts";
		$postsQuery = "SELECT * FROM posts ORDER BY id DESC LIMIT ".$pageSize." OFFSET ".$offset;
		$rowCountResult = mysqli_query($con, $rowCountQuery);
		$pagination = mysqli_fetch_assoc($rowCountResult);
		$postsResult = mysqli_query($con, $postsQuery);
		foreach ($postsResult as $postsRow) {
			$posts[] = $postsRow;
		}
		$data = array('pagination' => $pagination, 'posts' => $posts);
		header('Content-type: application/json');
		echo json_encode($data);
	});
	$app->post('/post/', function() use($app, $con) {
		$post = json_decode($app->request()->getBody(), true);
		$title = mysqli_real_escape_string($con, $post['title']);
		$content = mysqli_real_escape_string($con, $post['content']);
		$addPostQuery = "INSERT INTO posts (title, content) VALUES ('$title', '$content')";
		mysqli_query($con, $addPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => mysqli_insert_id($con), 'title' => $title, 'content' => $content));
	});
	$app->get('/post/:id', function($id) use($con) {
		$addPostQuery = "SELECT * FROM posts WHERE id = $id";
		$postsResult = mysqli_query($con, $addPostQuery);
		$data = mysqli_fetch_assoc($postsResult);
		header('Content-type: application/json');
		echo json_encode($data);
	});
	$app->put('/post/:id', function($id) use($app, $con) {
		$put = json_decode($app->request()->getBody(), true);
		$title = mysqli_real_escape_string($con, $put['title']);
		$content = mysqli_real_escape_string($con, $put['content']);
		$editPostQuery = "UPDATE posts SET title = '$title', content = '$content' WHERE id = $id";
		mysqli_query($con, $editPostQuery);
		header('Content-type: application/json');
		echo json_encode(array('id' => $id, 'title' => $title, 'content' => $content));
	});
	$app->delete('/post/:id', function($id) use($con) {
		$deletePostQuery = "DELETE FROM posts WHERE id = $id";
		mysqli_query($con, $deletePostQuery);
		header('Content-type: application/json');
		echo json_encode("delete post successful");
	});
	$app->run();
	mysqli_close($con);
?>